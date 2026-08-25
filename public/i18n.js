// =========================================================================
// THƯ VIỆN ĐA NGÔN NGỮ ĐỘNG TOÀN HỆ THỐNG MES (VI - EN - ZH)
// =========================================================================

const mesTranslations = {
  vi: {
    nav_create_wo: "🏠 Phát Lệnh",
    nav_oee: "📊 Dashboard OEE",
    nav_master: "📦 Dữ Liệu Gốc & BOM",
    nav_scan: "📱 Trạm Quét QR",
    nav_analytics: "📈 Phân Tích & APS",

    // Dashboard OEE
    oee_header_title: "📊 DASHBOARD HIỆU SUẤT THIẾT BỊ TỔNG THỂ (OEE)",
    oee_header_sub: "Giám sát thời gian thực thiết bị: Sẵn sàng (A), Tốc độ (P), Chất lượng (Q)",
    card_overall_oee: "OEE Toàn Xưởng",
    card_running_mc: "Máy Đang Chạy",
    card_idle_mc: "Máy Chờ / Nghỉ",
    card_breakdown_mc: "Máy Sự Cố Dừng",
    lbl_oee_index: "Chỉ số OEE:",
    lbl_avail_a: "Sẵn Sàng (A)",
    lbl_perf_p: "Hiệu Suất (P)",
    lbl_qual_q: "Chất Lượng (Q)",

    // Analytics & Simulation
    an_title: "📈 TRUNG TÂM PHÂN TÍCH NĂNG SUẤT, WIP, APS & ĐỊNH BIÊN NHÂN LỰC",
    an_subtitle: "Tính toán % tải thực tế theo OEE máy móc, năng suất công nhân, cảnh báo quá tải và định biên nhân sự theo ca",
    sim_header: "🚨 TRUNG TÂM KÍCH HOẠT GIẢ LẬP SỰ CỐ & ĐẨY TẢI TOÀN BỘ NHÀ MÁY",
    sim_desc: "Kích hoạt sự cố cục bộ hoặc đẩy tải hàng loạt 11,300 PCS để đo lường năng lực máy móc và nhân sự",
    btn_reset: "🔄 Phục Hồi Xưởng (Reset)",
    sc1: "1. Nghẽn Phôi CNC", sc1_sub: "Ứ đọng 800 phôi",
    sc2: "2. Đang Chạy Máy Hư", sc2_sub: "Máy Dập AIDA hỏng",
    sc3: "3. Thiếu Tôn Cuộn", sc3_sub: "Kho còn dưới 45kg",
    sc4: "4. Thợ Hàn Nghỉ Đột Xuất", sc4_sub: "Giảm 60% nhịp độ",
    sc5: "5. Đột Biến Đơn Gấp", sc5_sub: "+1,500 PCS trong 48h",
    sc6: "6. Lỗi Chất Lượng Sơn", sc6_sub: "80 phôi bong tróc",
    btn_flood: "🌊 ĐẨY TẢI CỰC ĐẠI: NẠP 4 ĐƠN HÀNG HÀNG LOẠT (11,300 PCS)",
    btn_crisis: "🔥 SIÊU KHỦNG HOẢNG: 2,000 PCS + HỎNG MÁY + NGHẼN CNC",
    mp_header: "👥 Phân Tích Cân Bằng Nhân Lực (Manpower Capacity & Headcount Planning)",
    mp_desc: "Tính toán số công nhân cần thiết theo tổng tải đơn hàng, xác định thừa/thiếu nhân sự cho từng xưởng theo ca (7.25h)",
    th_dept: "Phân Xưởng", th_curr_worker: "Công Nhân Hiện Có", th_min_need: "Tổng Phút Cần / Đơn", th_worker_need: "Công Nhân Cần (1 Ca)", th_load_per: "% Tải Nhân Lực", th_status: "Thừa / Thiếu", th_recommend: "Khuyến Nghị Định Biên Nhân Sự",
    aps_header: "⏱️ Điều Độ & Cân Bằng Tải APS",
    lbl_select_wo: "Chọn Lệnh Sản Xuất Cần Lập Lịch", lbl_start_date_aps: "Ngày Bắt Đầu Chạy", lbl_shift_aps: "Ca Sản Xuất Dự Kiến",
    btn_calc_aps: "⚡ Tính Toán Tải & Cân Bằng APS",
    matrix_header: "📊 Ma Trận Phân Bổ Tải Chi Tiết (Load Balancing Matrix)",
    th_op: "Công Đoạn", th_machine: "Máy & OEE", th_operator: "Công Nhân & Hiệu Suất", th_req_time: "Thời Gian Cần / Ca", th_load_pct: "% Tải Công Suất", th_eval: "Đánh Giá Tải",
    capex_header: "🏭 Phân Tích Năng Lực Phân Xưởng & Đề Xuất Đầu Tư Thiết Bị (CapEx)",
    capex_desc: "Xác định điểm nghẽn dây chuyền và khuyến nghị số máy cần bổ sung hoặc số ca cần tăng",
    th_capex_dept: "Phân Xưởng", th_capex_mach: "Số Máy Hiện Có", th_capex_cycle: "Chu Kỳ Chuẩn (s)", th_capex_cap: "Năng Lực Tối Đa (SP/Ca)", th_capex_demand: "Nhu Cầu Đơn Hàng", th_capex_load: "% Tải Phân Xưởng", th_capex_sug: "Đề Xuất Hành Động / Đầu Tư Máy Móc",
    andon_header: "⚠️ Nhật Ký Sự Cố & Hành Động Ứng Phó (Andon Logs)",
    th_time: "Thời Điểm", th_err_code: "Mã Lỗi", th_err_name: "Tên Sự Cố", th_severity: "Mức Độ",
    pareto_header: "📊 Biểu Đồ Pareto Lỗi Chất Lượng QC (Defect Pareto)",
    wip_header: "🔄 Dòng Chảy Bán Thành Phẩm Giữa Các Công Đoạn (WIP Tracking)",
    th_wip_wo: "Mã WO", th_wip_prod: "Sản Phẩm", th_wip_op: "Công Đoạn", th_wip_in: "Đầu Vào (In)", th_wip_queue: "Tồn Chờ Gia Công (WIP)", th_wip_ok: "Hoàn Thành (OK)", th_wip_ng: "Phế Phẩm (NG)", th_wip_status: "Trạng Thái"
  },
  en: {
    nav_create_wo: "🏠 Release WO",
    nav_oee: "📊 OEE Dashboard",
    nav_master: "📦 Master Data & BOM",
    nav_scan: "📱 QR Terminal",
    nav_analytics: "📈 Analytics & APS",

    // Dashboard OEE
    oee_header_title: "📊 OVERALL EQUIPMENT EFFECTIVENESS (OEE) DASHBOARD",
    oee_header_sub: "Real-time monitoring: Availability (A), Performance (P), Quality (Q)",
    card_overall_oee: "Plant-wide OEE",
    card_running_mc: "Running Machines",
    card_idle_mc: "Idle / Standby",
    card_breakdown_mc: "Breakdown / Down",
    lbl_oee_index: "OEE Index:",
    lbl_avail_a: "Availability (A)",
    lbl_perf_p: "Performance (P)",
    lbl_qual_q: "Quality (Q)",

    // Analytics & Simulation
    an_title: "📈 PRODUCTIVITY, WIP, APS & HEADCOUNT CAPACITY ANALYSIS CENTER",
    an_subtitle: "Calculate actual load % by machine OEE, worker efficiency, overload warnings and shift headcount planning",
    sim_header: "🚨 INCIDENT SIMULATION & PLANT-WIDE FLOODING CENTER",
    sim_desc: "Trigger local incidents or flood 11,300 PCS orders to test machine and labor capacity limits",
    btn_reset: "🔄 Factory Reset",
    sc1: "1. CNC Bottleneck", sc1_sub: "800 WIP queue",
    sc2: "2. Running Broken Machine", sc2_sub: "AIDA Press down",
    sc3: "3. Steel Coil Shortage", sc3_sub: "Stock < 45kg",
    sc4: "4. Sudden Welder Absence", sc4_sub: "Welding cap down 60%",
    sc5: "5. Sudden Rush Order", sc5_sub: "+1,500 PCS in 48h",
    sc6: "6. Mass Paint Defects", sc6_sub: "80 peeled parts",
    btn_flood: "🌊 EXTREME FLOODING: INJECT 4 MASSIVE ORDERS (11,300 PCS)",
    btn_crisis: "🔥 MEGA-CRISIS: 2,000 PCS + BROKEN PRESS + CNC BOTTLENECK",
    mp_header: "👥 Manpower Capacity & Headcount Planning",
    mp_desc: "Calculate required workers based on total order demand, identify headcount surplus/deficit per shift (7.25h)",
    th_dept: "Department", th_curr_worker: "Current Workers", th_min_need: "Total Mins Needed", th_worker_need: "Workers Req (1 Shift)", th_load_per: "Labor Load %", th_status: "Surplus / Deficit", th_recommend: "Headcount Recommendation",
    aps_header: "⏱️ APS Scheduling & Load Balancing",
    lbl_select_wo: "Select Work Order to Schedule", lbl_start_date_aps: "Planned Start Date", lbl_shift_aps: "Planned Shift",
    btn_calc_aps: "⚡ Calculate Load & Balance APS",
    matrix_header: "📊 Load Balancing Matrix",
    th_op: "Operation", th_machine: "Machine & OEE", th_operator: "Operator & Efficiency", th_req_time: "Time Req / Shift", th_load_pct: "Capacity Load %", th_eval: "Load Evaluation",
    capex_header: "🏭 Department Capacity & CapEx Equipment Recommendation",
    capex_desc: "Identify line bottlenecks and recommend machine expansion or shift additions",
    th_capex_dept: "Department", th_capex_mach: "Current Machines", th_capex_cycle: "Standard Cycle (s)", th_capex_cap: "Max Capacity (PCS/Shift)", th_capex_demand: "Order Demand", th_capex_load: "Dept Load %", th_capex_sug: "Action / CapEx Suggestion",
    andon_header: "⚠️ Andon Incident Action Logs",
    th_time: "Timestamp", th_err_code: "Error Code", th_err_name: "Incident Name", th_severity: "Severity",
    pareto_header: "📊 QC Defect Pareto Chart",
    wip_header: "🔄 WIP Flow Tracking Between Operations",
    th_wip_wo: "WO ID", th_wip_prod: "Product", th_wip_op: "Operation", th_wip_in: "Inbound", th_wip_queue: "Queue WIP", th_wip_ok: "Completed (OK)", th_wip_ng: "Scrap (NG)", th_wip_status: "Status"
  },
  zh: {
    nav_create_wo: "🏠 發放工單",
    nav_oee: "📊 OEE 儀表板",
    nav_master: "📦 基礎數據與 BOM",
    nav_scan: "📱 QR 掃碼工作站",
    nav_analytics: "📈 分析與 APS",

    // Dashboard OEE
    oee_header_title: "📊 設備總體效率 (OEE) 實時監控看板",
    oee_header_sub: "實時監控設備指標：時間稼動率 (A)、性能稼動率 (P)、良品率 (Q)",
    card_overall_oee: "全廠綜合 OEE",
    card_running_mc: "運行中設備",
    card_idle_mc: "待機 / 停用",
    card_breakdown_mc: "故障停機設備",
    lbl_oee_index: "OEE 指標:",
    lbl_avail_a: "時間稼動率 (A)",
    lbl_perf_p: "性能稼動率 (P)",
    lbl_qual_q: "良品率 (Q)",

    // Analytics & Simulation
    an_title: "📈 產能、WIP、APS 排程與人力編制分析中心",
    an_subtitle: "根據設備 OEE、工人效率計算實際負載百分比、過載警告及班次人力規劃",
    sim_header: "🚨 異常狀況模擬與全廠負荷中心",
    sim_desc: "觸發局部異常或批量注入 11,300 件訂單以測試設備與人力極限",
    btn_reset: "🔄 廠區重置 (Reset)",
    sc1: "1. CNC 瓶頸", sc1_sub: "積壓 800 件半成品",
    sc2: "2. 設備突發故障", sc2_sub: "AIDA 沖床故障",
    sc3: "3. 原材料短缺", sc3_sub: "熱軋鋼卷耗盡",
    sc4: "4. 焊接工突發缺勤", sc4_sub: "焊工產能下降 60%",
    sc5: "5. 緊急訂單突增", sc5_sub: "48小時內 +1,500 PCS",
    sc6: "6. 批次品質異常", sc6_sub: "80 件漆面剝落",
    btn_flood: "🌊 極端負荷：批量注入 4 筆大訂單 (11,300 PCS)",
    btn_crisis: "🔥 超級危機：2,000 PCS + 沖床故障 + CNC 瓶頸",
    mp_header: "👥 人力平衡與編制規劃 (Manpower Planning)",
    mp_desc: "根據總訂單需求計算所需工人數，評估每班次各車間的人力盈餘或短缺 (7.25h)",
    th_dept: "車間部門", th_curr_worker: "現有工人", th_min_need: "總需工時 (分)", th_worker_need: "所需工人 (1班)", th_load_per: "人力負載 %", th_status: "盈餘 / 短缺", th_recommend: "人力編制建議",
    aps_header: "⏱️ APS 排程與負載平衡",
    lbl_select_wo: "選擇要排程的工單", lbl_start_date_aps: "計劃開始日期", lbl_shift_aps: "計劃班次",
    btn_calc_aps: "⚡ 計算負荷與 APS 平衡",
    matrix_header: "📊 詳細負載分配矩陣",
    th_op: "工序", th_machine: "設備與 OEE", th_operator: "操作員與效率", th_req_time: "所需時間/班", th_load_pct: "產能負載 %", th_eval: "負載評估",
    capex_header: "🏭 車間產能分析與資本支出 (CapEx) 設備投資建議",
    capex_desc: "識別產線瓶頸並推薦增加設備或增加班次",
    th_capex_dept: "車間部門", th_capex_mach: "現有設備數", th_capex_cycle: "標準周期(s)", th_capex_cap: "最大產能(件/班)", th_capex_demand: "訂單需求", th_capex_load: "車間負載 %", th_capex_sug: "行動 / 設備投資建議",
    andon_header: "⚠️ Andon 異常事件與應對日誌",
    th_time: "時間", th_err_code: "異常代碼", th_err_name: "異常名稱", th_severity: "嚴重程度",
    pareto_header: "📊 QC 品質不良柏拉圖 (Defect Pareto)",
    wip_header: "🔄 工序間在製品 (WIP) 流向追蹤",
    th_wip_wo: "工單號", th_wip_prod: "產品名稱", th_wip_op: "工序", th_wip_in: "投入量", th_wip_queue: "待加工 WIP", th_wip_ok: "合格數 (OK)", th_wip_ng: "報廢數 (NG)", th_wip_status: "狀態"
  }
};

const dynamicLexicon = {
  // Phân xưởng
  "Xưởng Dập": { en: "Stamping Shop", zh: "沖壓車間" },
  "Xưởng CNC": { en: "CNC Machining", zh: "CNC 加工車間" },
  "Xưởng Hàn": { en: "Welding Shop", zh: "焊接車間" },
  "Xưởng Sơn": { en: "Painting Shop", zh: "塗裝車間" },
  "Xưởng Lắp Ráp": { en: "Assembly Line", zh: "組裝線" },
  "Xưởng QC": { en: "QC Inspection", zh: "品管檢驗" },
  "Xưởng Chung": { en: "General Plant", zh: "綜合廠區" },

  // Máy móc thiết bị (Dàn máy hiện tại)
  "Băng chuyền lắp ráp #01": { en: "Assembly Conveyor #01", zh: "組裝流水線 #01" },
  "Máy phay CNC 3 trục #01": { en: "3-Axis CNC Mill #01", zh: "3軸 CNC 銑床 #01" },
  "Máy phay CNC 4 trục #02": { en: "4-Axis CNC Mill #02", zh: "4軸 CNC 銑床 #02" },
  "Dây chuyền sơn tự động": { en: "Auto Powder Coating Line", zh: "自動粉體塗裝線" },
  "Máy dập 110 Tấn #01": { en: "110T Press Machine #01", zh: "110噸 沖床 #01" },
  "Máy dập 200 Tấn #01": { en: "200T Press Machine #01", zh: "200噸 沖床 #01" },
  "Máy dập cơ 160T AIDA": { en: "AIDA 160T Mechanical Press", zh: "AIDA 160噸 機械沖床" },
  "Máy phay đứng CNC Mazak": { en: "Mazak Vertical CNC Mill", zh: "Mazak 立式 CNC 銑床" },
  "Robot hàn tự động OTC": { en: "OTC Auto Welding Robot", zh: "OTC 自動焊接機器人" },
  "Buồng phun sơn tĩnh điện Wagner": { en: "Wagner Powder Coating Booth", zh: "Wagner 靜電塗裝房" },
  "Bàn lắp ráp & đóng gói băng tải": { en: "Assembly & Packing Bench", zh: "組裝與包裝流水工作台" },

  // Sản phẩm
  "Khung đỡ máy hoàn thiện": { en: "Complete Machine Frame FG", zh: "完整機架成品" },
  "Khung máy": { en: "Machine Frame", zh: "機台框架" },
  "Vỏ tủ điện": { en: "Electrical Enclosure", zh: "配電箱外殼" },
  "Tay đỡ robot": { en: "Robot Arm Bracket", zh: "機器人機械臂支架" },

  // Trạng thái máy
  "IDLE": { en: "IDLE", zh: "待機" },
  "RUNNING": { en: "RUNNING", zh: "運行中" },
  "BREAKDOWN": { en: "BREAKDOWN", zh: "故障停機" },

  // Công đoạn
  "Bước 10 - Dập Cắt & Định Hình": { en: "Step 10 - Blanking & Stamping", zh: "工序 10 - 沖壓下料與成型" },
  "Bước 20 - Phay CNC Chi Tiết": { en: "Step 20 - Precision CNC Milling", zh: "工序 20 - CNC 精密銑削" },
  "Bước 30 - Hàn Kết Cấu Khung": { en: "Step 30 - Structure Frame Welding", zh: "工序 30 - 結構框架焊接" },
  "Bước 40 - Sơn Tĩnh Điện": { en: "Step 40 - Powder Coating", zh: "工序 40 - 粉體靜電塗裝" },
  "Bước 50 - Lắp Ráp & Đóng Gói": { en: "Step 50 - Assembly & Final Packing", zh: "工序 50 - 組裝與成品包裝" }
};

function getSavedLanguage() {
  return localStorage.getItem('mes_language') || 'vi';
}

function setLanguage(lang) {
  localStorage.setItem('mes_language', lang);
  applyTranslations(lang);
}

function t(text) {
  if (!text) return '';
  const lang = getSavedLanguage();
  if (lang === 'vi') return text;

  const cleanText = String(text).trim();

  // Khớp chính xác từ điển
  if (dynamicLexicon[cleanText] && dynamicLexicon[cleanText][lang]) {
    return dynamicLexicon[cleanText][lang];
  }

  // Quét thay thế các từ khóa con
  let translated = cleanText;
  Object.keys(dynamicLexicon).forEach(key => {
    if (translated.includes(key) && dynamicLexicon[key][lang]) {
      translated = translated.replaceAll(key, dynamicLexicon[key][lang]);
    }
  });

  return translated;
}

function applyTranslations(lang) {
  const tDict = mesTranslations[lang] || mesTranslations.vi;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (tDict[key]) {
      if (el.tagName === 'INPUT' && el.getAttribute('placeholder')) {
        el.placeholder = tDict[key];
      } else {
        el.innerText = tDict[key];
      }
    }
  });

  const langSelect = document.getElementById('langSelect');
  if (langSelect) langSelect.value = lang;
}

document.addEventListener('DOMContentLoaded', () => {
  applyTranslations(getSavedLanguage());
});