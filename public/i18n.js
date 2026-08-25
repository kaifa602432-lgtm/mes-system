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

    // index.html
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

    // operator.html
    op_header_title: "📱 TRẠM QUÉT QR & THAO TÁC CÔNG ĐOẠN XƯỞNG",
    op_header_sub: "Dành cho công nhân đứng máy cập nhật sản lượng OK / NG và kích hoạt ANDON",
    card_scan_qr: "📷 Quét Thẻ Công Đoạn",
    lbl_scan_input: "Nhập mã thẻ hoặc Quét mã QR...",
    btn_scan_action: "🔍 Quét",
    lbl_machine_select: "Chọn Máy Gia Công",
    lbl_operator_code: "Mã Công Nhân",
    btn_start_job: "▶ BẮT ĐẦU GIA CÔNG",
    btn_finish_job: "■ HOÀN THÀNH & LƯU",
    lbl_good_qty: "SL ĐẠT (OK)",
    lbl_scrap_qty: "SL HỎNG (NG)",
    lbl_defect_select: "Mã Lỗi Phát Sinh (Nếu có)",

    // master-data.html
    md_header_title: "📦 QUẢN TRỊ DỮ LIỆU GỐC & ĐỊNH MỨC BOM",
    md_header_sub: "Quản lý danh mục Nguyên vật liệu, Máy móc & Định mức tiêu hao kỹ thuật",
    card_mat_stock: "Danh Mục Vật Tư & Tồn Kho Thực Tế",
    th_mat_code: "Mã Vật Tư",
    th_mat_name: "Tên Vật Tư / Quy Cách",
    th_mat_unit: "ĐVT",
    th_mat_stock: "Tồn Thực Tế",
    card_bom_tree: "Định Mức Kỹ Thuật (BOM Tree)",
    lbl_bom_prod: "Mã Hàng:",
    th_bom_mat: "Vật Tư Tiêu Hao",
    th_bom_qty: "Định Mức / SP",
    th_bom_scrap: "Hao Hụt (%)",
    th_bom_notes: "Ghi Chú Công Đoạn",
    card_mach_list: "Danh Mục Máy Móc & Thời Gian Chu Kỳ Chuẩn (OEE Base)",
    th_mc_id: "Mã Máy",
    th_mc_name: "Tên Máy",
    th_mc_dept: "Phân Xưởng",
    th_mc_cycle: "Chu Kỳ Chuẩn (Cycle Time)",
    th_mc_status: "Trạng Thái",

    // dashboard.html
    oee_header_title: "📊 DASHBOARD HIỆU SUẤT THIẾT BỊ TỔNG THỂ (OEE)",
    oee_header_sub: "Giám sát thời gian thực thiết bị: Sẵn sàng (A), Tốc độ (P), Chất lượng (Q)",
    card_overall_oee: "OEE Toàn Xưởng",
    card_running_mc: "Máy Đang Chạy",
    card_idle_mc: "Máy Chờ / Nghỉ",
    card_breakdown_mc: "Máy Sự Cố Dừng",
    lbl_oee_index: "Chỉ số OEE:",
    lbl_avail_a: "Sẵn Sàng (A)",
    lbl_perf_p: "Hiệu Suất (P)",
    lbl_qual_q: "Chất Lượng (Q)"
  },
  en: {
    nav_create_wo: "🏠 Release WO",
    nav_oee: "📊 OEE Dashboard",
    nav_master: "📦 Master Data & BOM",
    nav_scan: "📱 QR Terminal",
    nav_analytics: "📈 Analytics & APS",

    // index.html
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

    // operator.html
    op_header_title: "📱 SHOPFLOOR QR TERMINAL & DISPATCH",
    op_header_sub: "For machine operators to log OK/NG output, scan job tickets, and trigger Andon",
    card_scan_qr: "📷 Scan Routing Job Ticket",
    lbl_scan_input: "Enter Ticket Code or Scan QR...",
    btn_scan_action: "🔍 Scan",
    lbl_machine_select: "Select Assigned Machine",
    lbl_operator_code: "Operator ID",
    btn_start_job: "▶ START OPERATION",
    btn_finish_job: "■ COMPLETE & SAVE",
    lbl_good_qty: "GOOD QTY (OK)",
    lbl_scrap_qty: "SCRAP QTY (NG)",
    lbl_defect_select: "Defect Code (If scrap occurred)",

    // master-data.html
    md_header_title: "📦 MASTER DATA & BILL OF MATERIALS (BOM)",
    md_header_sub: "Raw Material Master, Machine Catalog & Engineering Consumption Rates",
    card_mat_stock: "Material Catalog & On-Hand Inventory",
    th_mat_code: "Material ID",
    th_mat_name: "Material Name / Specs",
    th_mat_unit: "Unit",
    th_mat_stock: "Current Stock",
    card_bom_tree: "Engineering BOM Tree",
    lbl_bom_prod: "Product:",
    th_bom_mat: "Material Consumed",
    th_bom_qty: "Usage / Part",
    th_bom_scrap: "Scrap (%)",
    th_bom_notes: "Operation Notes",
    card_mach_list: "Machine Catalog & Standard Cycle Time (OEE Base)",
    th_mc_id: "Machine ID",
    th_mc_name: "Machine Name",
    th_mc_dept: "Department",
    th_mc_cycle: "Standard Cycle Time",
    th_mc_status: "Status",

    // dashboard.html
    oee_header_title: "📊 OVERALL EQUIPMENT EFFECTIVENESS (OEE) DASHBOARD",
    oee_header_sub: "Real-time monitoring: Availability (A), Performance (P), Quality (Q)",
    card_overall_oee: "Plant-wide OEE",
    card_running_mc: "Running Machines",
    card_idle_mc: "Idle / Standby",
    card_breakdown_mc: "Breakdown / Down",
    lbl_oee_index: "OEE Index:",
    lbl_avail_a: "Availability (A)",
    lbl_perf_p: "Performance (P)",
    lbl_qual_q: "Quality (Q)"
  },
  zh: {
    nav_create_wo: "🏠 發放工單",
    nav_oee: "📊 OEE 儀表板",
    nav_master: "📦 基礎數據與 BOM",
    nav_scan: "📱 QR 掃碼工作站",
    nav_analytics: "📈 分析與 APS",

    // index.html
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

    // operator.html
    op_header_title: "📱 車間現場 QR 掃碼操作站",
    op_header_sub: "供機台操作員記錄合格/報廢數量、掃描工序卡並觸發 Andon 警報",
    card_scan_qr: "📷 掃描工序隨行卡",
    lbl_scan_input: "輸入卡號或掃描 QR 碼...",
    btn_scan_action: "🔍 查詢",
    lbl_machine_select: "選擇加工設備",
    lbl_operator_code: "操作員編號",
    btn_start_job: "▶ 開始加工",
    btn_finish_job: "■ 完工並保存",
    lbl_good_qty: "合格數量 (OK)",
    lbl_scrap_qty: "報廢數量 (NG)",
    lbl_defect_select: "不良原因代碼 (如有報廢)",

    // master-data.html
    md_header_title: "📦 基礎數據與物料清單 (BOM) 管理",
    md_header_sub: "管理原材料料號、機台目錄及工程定額損耗",
    card_mat_stock: "原材料目錄與現有庫存",
    th_mat_code: "物料代碼",
    th_mat_name: "物料名稱 / 規格",
    th_mat_unit: "單位",
    th_mat_stock: "實體庫存",
    card_bom_tree: "工程物料清單結構 (BOM Tree)",
    lbl_bom_prod: "成品料號:",
    th_bom_mat: "消耗物料",
    th_bom_qty: "標準用量 / 件",
    th_bom_scrap: "損耗率 (%)",
    th_bom_notes: "工序備註說明",
    card_mach_list: "機台設備清單與標準週期 (OEE 基礎)",
    th_mc_id: "設備編號",
    th_mc_name: "設備名稱",
    th_mc_dept: "所屬車間",
    th_mc_cycle: "標準週期 (Cycle Time)",
    th_mc_status: "狀態",

    // dashboard.html
    oee_header_title: "📊 設備總體效率 (OEE) 實時監控看板",
    oee_header_sub: "實時監控設備指標：時間稼動率 (A)、性能稼動率 (P)、良品率 (Q)",
    card_overall_oee: "全廠綜合 OEE",
    card_running_mc: "運行中設備",
    card_idle_mc: "待機 / 停用",
    card_breakdown_mc: "故障停機設備",
    lbl_oee_index: "OEE 指標:",
    lbl_avail_a: "時間稼動率 (A)",
    lbl_perf_p: "性能稼動率 (P)",
    lbl_qual_q: "良品率 (Q)"
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
  "Xưởng Chung": { en: "General Shop", zh: "綜合車間" },

  // Sản phẩm
  "Khung đỡ máy hoàn thiện": { en: "Complete Machine Frame FG", zh: "完整機架成品" },
  "Khung máy": { en: "Machine Frame", zh: "機台框架" },
  "Vỏ tủ điện": { en: "Electrical Enclosure", zh: "配電箱外殼" },
  "Tay đỡ robot": { en: "Robot Arm Bracket", zh: "機器人機械臂支架" },

  // Vật tư
  "Bulong lục giác M8x30": { en: "Hex Bolt M8x30", zh: "外六角螺栓 M8x30" },
  "Mạ kẽm cấp bền 8.8": { en: "Zinc Plated Grade 8.8", zh: "鍍鋅 8.8級" },
  "Tôn cuộn cán nóng SS400": { en: "Hot-Rolled Steel Coil SS400", zh: "熱軋鋼卷 SS400" },
  "Dày 2.5mm, Khổ 1200mm": { en: "Thick 2.5mm, Width 1200mm", zh: "厚度 2.5mm, 寬度 1200mm" },
  "Bột sơn tĩnh điện màu đen": { en: "Black Powder Coating Paint", zh: "黑色粉體靜電塗料" },
  "Độ phủ 8-10m2/kg": { en: "Coverage 8-10m2/kg", zh: "塗佈率 8-10m2/kg" },
  "Thép ống tròn STK400": { en: "Round Steel Pipe STK400", zh: "STK400 圓形鋼管" },
  "D34 x 1.8mm x 6000mm": { en: "D34 x 1.8mm x 6000mm", zh: "外徑34 x 1.8mm x 6米" },

  // Đơn vị tính
  "con": { en: "pcs", zh: "支" },
  "kg": { en: "kg", zh: "公斤" },
  "m": { en: "m", zh: "米" },
  "PCS": { en: "PCS", zh: "件" },

  // Ghi chú BOM
  "Dập phôi thân khung đỡ (3.5kg/sp, hao hụt 3%)": { en: "Body blank stamping (3.5kg/pc, 3% scrap)", zh: "機架主體沖壓下料 (3.5kg/件, 損耗3%)" },
  "Thanh giằng chịu lực (1.2m/sp, hao hụt 2%)": { en: "Cross bracing pipe (1.2m/pc, 2% scrap)", zh: "承重橫撐拉桿管件 (1.2米/件, 損耗2%)" },
  "Sơn bề mặt (0.25kg/sp, hao hụt 5%)": { en: "Surface powder coating (0.25kg/pc, 5% scrap)", zh: "機體表面靜電噴塗 (0.25kg/件, 損耗5%)" },
  "Bulong lắp ghép chân đế (4 con/sp)": { en: "Base assembly bolts (4 pcs/pc)", zh: "底座固定連接螺栓 (4支/件)" },

  // Máy móc
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

  // Trạng thái máy
  "IDLE": { en: "IDLE", zh: "待機" },
  "RUNNING": { en: "RUNNING", zh: "運行中" },
  "BREAKDOWN": { en: "BREAKDOWN", zh: "故障停機" },
  "RELEASED": { en: "RELEASED", zh: "已發放" },
  "PENDING": { en: "PENDING", zh: "待處理" },
  "COMPLETED": { en: "COMPLETED", zh: "已完工" }
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

  if (dynamicLexicon[cleanText] && dynamicLexicon[cleanText][lang]) {
    return dynamicLexicon[cleanText][lang];
  }

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