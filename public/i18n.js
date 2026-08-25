// =========================================================================
// THƯ VIỆN ĐA NGÔN NGỮ TOÀN HỆ THỐNG MES (VI - EN - ZH)
// =========================================================================
const mesTranslations = {
  vi: {
    // Menu & Header
    nav_create_wo: "🏠 Phát Lệnh",
    nav_oee: "📊 Dashboard OEE",
    nav_master: "📦 Dữ Liệu Gốc & BOM",
    nav_scan: "📱 Trạm Quét QR",
    nav_analytics: "📈 Phân Tích & APS",
    
    // Trang Phát Lệnh (index.html)
    app_title: "HỆ THỐNG MES - QUẢN LÝ SẢN XUẤT",
    app_subtitle: "Theo dõi tiến độ, phát lệnh, cấp phát định mức & thẻ công đoạn QR",
    card_create_wo: "➕ Tạo Lệnh Sản Xuất",
    lbl_wo_id: "Mã Lệnh (WO ID)",
    lbl_product: "Sản phẩm",
    lbl_plan_qty: "Số lượng kế hoạch (PCS)",
    lbl_start_date: "Bắt đầu",
    lbl_due_date: "Hoàn thành",
    btn_release_wo: "Phát Lệnh (Release WO)",
    card_wo_list: "📋 Danh Sách Lệnh Sản Xuất",
    btn_refresh: "🔄 Làm mới",
    th_wo_code: "Mã WO",
    th_prod_name: "Tên Sản Phẩm",
    th_plan_qty: "SL Kế Hoạch",
    th_status: "Trạng Thái",
    th_action: "Thao Tác",
    btn_view_qr: "Xem Thẻ QR",
    card_qr_section: "🏷️ Thẻ Công Đoạn & Mã QR Lệnh:",
    btn_print_cards: "🖨️ In Danh Sách Thẻ",

    // Trang Trạm Quét QR (operator.html)
    op_header_title: "📱 TRẠM QUÉT QR & THAO TÁC CÔNG ĐOẠN XƯỞNG",
    op_header_sub: "Dành cho công nhân đứng máy cập nhật sản lượng OK / NG và kích hoạt ANDON",
    card_scan_qr: "📷 Quét Thẻ Công Đoạn",
    lbl_scan_input: "Nhập mã thẻ hoặc Quét mã QR",
    btn_scan_action: "🔍 Quét",
    lbl_ticket_info: "Thông Tin Công Đoạn",
    lbl_machine_select: "Chọn Máy Gia Công",
    lbl_operator_code: "Mã Công Nhân",
    btn_start_job: "▶ BẮT ĐẦU GIA CÔNG",
    btn_finish_job: "■ HOÀN THÀNH & LƯU",
    lbl_good_qty: "SL ĐẠT (OK)",
    lbl_scrap_qty: "SL HỎNG (NG)",
    lbl_defect_select: "Mã Lỗi Phát Sinh (Nếu có)",

    // Trang Dashboard OEE (dashboard.html)
    oee_header_title: "📊 DASHBOARD HIỆU SUẤT THIẾT BỊ TỔNG THỂ (OEE)",
    oee_header_sub: "Giám sát thời gian thực 14 thiết bị: Sẵn sàng (A), Tốc độ (P), Chất lượng (Q)",
    lbl_dept_stamp: "Xưởng Dập",
    lbl_dept_cnc: "Xưởng Phay & Tiện CNC",
    lbl_dept_weld: "Xưởng Hàn Kết Cấu",
    lbl_dept_paint: "Xưởng Sơn Tĩnh Điện",
    lbl_dept_assy: "Xưởng Lắp Ráp & QC",
    card_overall_oee: "OEE Toàn Xưởng",
    card_running_mc: "Máy Đang Chạy",
    card_idle_mc: "Máy Chờ / Nghỉ",
    card_breakdown_mc: "Máy Sự Cố Dừng",

    // Trang Master Data & BOM (master-data.html)
    md_header_title: "📦 QUẢN LÝ DỮ LIỆU GỐC & ĐỊNH MỨC BOM",
    md_header_sub: "Danh mục sản phẩm, cấu trúc BOM nguyên vật liệu và tiến trình gia công Routings",
    card_product_list: "Danh Mục Thành Phẩm",
    card_material_stock: "Tồn Kho Nguyên Vật Liệu (SS400, Sơn, Ống thép)",
    card_bom_structure: "Cấu Trúc Định Mức BOM Chi Tiết",
    card_routing_steps: "Quy Trình Công Nghệ (Routings)",

    // Trang Phân Tích & APS (analytics.html)
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
    // Menu & Header
    nav_create_wo: "🏠 Release WO",
    nav_oee: "📊 OEE Dashboard",
    nav_master: "📦 Master Data & BOM",
    nav_scan: "📱 QR Terminal",
    nav_analytics: "📈 Analytics & APS",
    
    // Work Order Release (index.html)
    app_title: "MES SYSTEM - PRODUCTION EXECUTION",
    app_subtitle: "Real-time tracking, order release, BOM auto-allocation & routing QR job tickets",
    card_create_wo: "➕ Create Work Order",
    lbl_wo_id: "Work Order ID (WO ID)",
    lbl_product: "Product",
    lbl_plan_qty: "Planned Quantity (PCS)",
    lbl_start_date: "Start Date",
    lbl_due_date: "Due Date",
    btn_release_wo: "Release Work Order",
    card_wo_list: "📋 Work Order Register",
    btn_refresh: "🔄 Refresh",
    th_wo_code: "WO ID",
    th_prod_name: "Product Name",
    th_plan_qty: "Plan Qty",
    th_status: "Status",
    th_action: "Action",
    btn_view_qr: "View QR Tickets",
    card_qr_section: "🏷️ Routing Step Job Tickets & QR Codes:",
    btn_print_cards: "🖨️ Print Job Tickets",

    // QR Operator Terminal (operator.html)
    op_header_title: "📱 SHOPFLOOR QR TERMINAL & DISPATCH",
    op_header_sub: "For machine operators to log OK/NG output, scan job tickets, and trigger Andon",
    card_scan_qr: "📷 Scan Routing Job Ticket",
    lbl_scan_input: "Enter Ticket Code or Scan QR",
    btn_scan_action: "🔍 Scan",
    lbl_ticket_info: "Operation Details",
    lbl_machine_select: "Select Assigned Machine",
    lbl_operator_code: "Operator ID",
    btn_start_job: "▶ START OPERATION",
    btn_finish_job: "■ COMPLETE & SAVE",
    lbl_good_qty: "GOOD QTY (OK)",
    lbl_scrap_qty: "SCRAP QTY (NG)",
    lbl_defect_select: "Defect Code (If scrap occurred)",

    // OEE Dashboard (dashboard.html)
    oee_header_title: "📊 OVERALL EQUIPMENT EFFECTIVENESS (OEE) DASHBOARD",
    oee_header_sub: "Real-time monitoring of 14 machines: Availability (A), Performance (P), Quality (Q)",
    lbl_dept_stamp: "Stamping Shop",
    lbl_dept_cnc: "CNC Milling & Turning",
    lbl_dept_weld: "Welding & Structure",
    lbl_dept_paint: "Powder Coating Shop",
    lbl_dept_assy: "Assembly & QC Line",
    card_overall_oee: "Plant-wide OEE",
    card_running_mc: "Running Machines",
    card_idle_mc: "Idle / Standby",
    card_breakdown_mc: "Breakdown / Down",

    // Master Data (master-data.html)
    md_header_title: "📦 MASTER DATA & BILL OF MATERIALS (BOM)",
    md_header_sub: "Finished goods catalogue, raw material inventory & process routing plans",
    card_product_list: "Product Master List",
    card_material_stock: "Raw Material Inventory (Coils, Powder, Pipes)",
    card_bom_structure: "Detailed Bill of Materials (BOM)",
    card_routing_steps: "Standard Process Routings",

    // Analytics & APS (analytics.html)
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
    // Menu & Header
    nav_create_wo: "🏠 發放工單",
    nav_oee: "📊 OEE 儀表板",
    nav_master: "📦 基礎數據與 BOM",
    nav_scan: "📱 QR 掃碼工作站",
    nav_analytics: "📈 分析與 APS",
    
    // Work Order Release (index.html)
    app_title: "MES 生產執行與製造管理系統",
    app_subtitle: "實時進度追蹤、工單發放、BOM 物料自動扣減及工序 QR 隨行卡",
    card_create_wo: "➕ 創建生產工單",
    lbl_wo_id: "工單編號 (WO ID)",
    lbl_product: "產品型號",
    lbl_plan_qty: "計劃生產數量 (PCS)",
    lbl_start_date: "計劃開工",
    lbl_due_date: "交貨日期",
    btn_release_wo: "發放工單 (Release WO)",
    card_wo_list: "📋 生產工單清單",
    btn_refresh: "🔄 刷新數據",
    th_wo_code: "工單號",
    th_prod_name: "產品名稱",
    th_plan_qty: "計劃數量",
    th_status: "狀態",
    th_action: "操作",
    btn_view_qr: "查看 QR 卡",
    card_qr_section: "🏷️ 工序隨行卡與 QR 碼：",
    btn_print_cards: "🖨️ 列印工序卡",

    // QR Operator Terminal (operator.html)
    op_header_title: "📱 車間現場 QR 掃碼操作站",
    op_header_sub: "供機台操作員記錄合格/報廢數量、掃描工序卡並觸發 Andon 警報",
    card_scan_qr: "📷 掃描工序隨行卡",
    lbl_scan_input: "輸入卡號或掃描 QR 碼",
    btn_scan_action: "🔍 查詢",
    lbl_ticket_info: "工序詳細信息",
    lbl_machine_select: "選擇加工設備",
    lbl_operator_code: "操作員編號",
    btn_start_job: "▶ 開始加工",
    btn_finish_job: "■ 完工並保存",
    lbl_good_qty: "合格數量 (OK)",
    lbl_scrap_qty: "報廢數量 (NG)",
    lbl_defect_select: "不良原因代碼 (如有報廢)",

    // OEE Dashboard (dashboard.html)
    oee_header_title: "📊 設備總體效率 (OEE) 實時監控看板",
    oee_header_sub: "實時監控 14 台設備：時間稼動率 (A)、性能稼動率 (P)、良品率 (Q)",
    lbl_dept_stamp: "沖壓車間",
    lbl_dept_cnc: "CNC 銑削與車削",
    lbl_dept_weld: "焊接與結構車間",
    lbl_dept_paint: "粉體塗裝車間",
    lbl_dept_assy: "組裝與品管線",
    card_overall_oee: "全廠綜合 OEE",
    card_running_mc: "運行中設備",
    card_idle_mc: "待機 / 停用",
    card_breakdown_mc: "故障停機設備",

    // Master Data (master-data.html)
    md_header_title: "📦 基礎數據與物料清單 (BOM) 管理",
    md_header_sub: "成品料號、原材料庫存 (鋼卷、塗料、鋼管) 及工藝工序路徑",
    card_product_list: "成品料號主檔",
    card_material_stock: "原材料現有庫存",
    card_bom_structure: "物料清單 (BOM) 明細",
    card_routing_steps: "標準工藝工序路徑 (Routings)",

    // Analytics & APS (analytics.html)
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

// Hàm lấy ngôn ngữ hiện tại đã lưu
function getSavedLanguage() {
  return localStorage.getItem('mes_language') || 'vi';
}

// Hàm thay đổi ngôn ngữ và lưu vào localStorage cho toàn bộ hệ thống
function setLanguage(lang) {
  localStorage.setItem('mes_language', lang);
  applyTranslations(lang);
}

// Hàm quét tất cả các thẻ có thuộc tính data-i18n để tự động dịch
function applyTranslations(lang) {
  const t = mesTranslations[lang] || mesTranslations.vi;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      if (el.tagName === 'INPUT' && el.getAttribute('placeholder')) {
        el.placeholder = t[key];
      } else {
        el.innerText = t[key];
      }
    }
  });

  // Cập nhật giá trị hiển thị trên dropdown chọn ngôn ngữ (nếu có trên trang)
  const langSelect = document.getElementById('langSelect');
  if (langSelect) langSelect.value = lang;
}

// Tự động dịch ngay khi tải trang
document.addEventListener('DOMContentLoaded', () => {
  const currentLang = getSavedLanguage();
  applyTranslations(currentLang);
});