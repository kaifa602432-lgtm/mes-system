require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 1. MASTER DATA APIs
// ==========================================
app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM md_products ORDER BY product_id');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/materials', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM md_materials ORDER BY material_id');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/bom/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const query = `
      SELECT b.bom_id, b.material_id, m.material_name, m.specifications, 
             m.unit, b.quantity_required, b.scrap_rate_percent, b.notes,
             m.current_stock
      FROM md_bom b
      JOIN md_materials m ON b.material_id = m.material_id
      WHERE b.product_id = $1
      ORDER BY b.bom_id;
    `;
    const { rows } = await db.query(query, [productId]);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/machines', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM md_machines ORDER BY machine_id');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/shifts', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM md_shifts ORDER BY shift_id');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. PRODUCTION DISPATCH & WIP INITIALIZATION
// ==========================================
app.post('/api/work-orders', async (req, res) => {
  const { wo_id, product_id, plan_quantity, planned_start_date, planned_due_date } = req.body;
  try {
    await db.query('BEGIN');

    // 1. Tạo Work Order
    const woQuery = `
      INSERT INTO mes_work_orders (wo_id, product_id, plan_quantity, planned_start_date, planned_due_date, status)
      VALUES ($1, $2, $3, $4, $5, 'RELEASED') RETURNING *;
    `;
    await db.query(woQuery, [wo_id, product_id, Number(plan_quantity), planned_start_date, planned_due_date]);

    // 2. Cấp phát NVL & trừ tồn kho theo BOM
    await db.query('SELECT allocate_wo_materials($1::text, $2::text, $3::numeric)', [
      String(wo_id),
      String(product_id),
      Number(plan_quantity)
    ]);

    // 3. Lấy lưu trình và sinh Job Tickets + Khởi tạo bảng luân chuyển WIP
    const routingQuery = `
      SELECT r.step_order, r.operation_id, r.standard_time_minutes
      FROM md_routings r WHERE r.product_id = $1 ORDER BY r.step_order ASC;
    `;
    const { rows: steps } = await db.query(routingQuery, [product_id]);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const ticketId = `${wo_id}-STEP${step.step_order}`;
      
      // Tạo Job Ticket
      await db.query(
        `INSERT INTO mes_job_tickets (ticket_id, wo_id, operation_id, step_order, target_qty, status)
         VALUES ($1, $2, $3, $4, $5, 'PENDING')`,
        [ticketId, wo_id, step.operation_id, step.step_order, Number(plan_quantity)]
      );

      // Khởi tạo dòng chờ WIP (Bước 10 nhận toàn bộ phôi đầu vào, các bước sau chờ nhận từ bước trước)
      const initialIn = i === 0 ? Number(plan_quantity) : 0;
      await db.query(
        `INSERT INTO mes_wip_inventory (wo_id, operation_id, step_order, in_qty, wip_qty, out_good_qty, out_scrap_qty)
         VALUES ($1, $2, $3, $4, $4, 0, 0)
         ON CONFLICT (wo_id, step_order) DO NOTHING`,
        [wo_id, step.operation_id, step.step_order, initialIn]
      );
    }

    await db.query('COMMIT');
    res.json({ success: true, message: `Phát lệnh ${wo_id} thành công! Đã cấp phát NVL và khởi tạo dòng chảy WIP.` });
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/work-orders', async (req, res) => {
  try {
    const query = `
      SELECT w.*, p.product_name, p.unit 
      FROM mes_work_orders w
      JOIN md_products p ON w.product_id = p.product_id
      ORDER BY w.created_at DESC;
    `;
    const { rows } = await db.query(query);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/work-orders/:woId/tickets', async (req, res) => {
  try {
    const { woId } = req.params;
    const query = `
      SELECT t.*, o.operation_name, o.department
      FROM mes_job_tickets t
      JOIN md_operations o ON t.operation_id = o.operation_id
      WHERE t.wo_id = $1
      ORDER BY t.step_order ASC;
    `;
    const { rows } = await db.query(query, [woId]);
    res.json({ success: true, tickets: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. SHOPFLOOR EXECUTION & WIP FLOW UPDATE
// ==========================================
app.get('/api/shopfloor/scan/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const query = `
      SELECT t.*, w.product_id, p.product_name, o.operation_name
      FROM mes_job_tickets t
      JOIN mes_work_orders w ON t.wo_id = w.wo_id
      JOIN md_products p ON w.product_id = p.product_id
      JOIN md_operations o ON t.operation_id = o.operation_id
      WHERE t.ticket_id = $1;
    `;
    const { rows } = await db.query(query, [ticketId]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy thẻ công đoạn!' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/shopfloor/start', async (req, res) => {
  const { ticket_id, machine_id, operator_code } = req.body;
  try {
    await db.query('BEGIN');
    const { rows } = await db.query(
      `INSERT INTO mes_production_logs (ticket_id, machine_id, operator_code, start_time)
       VALUES ($1, $2, $3, NOW()) RETURNING log_id`,
      [ticket_id, machine_id, operator_code]
    );
    await db.query(`UPDATE mes_job_tickets SET status = 'RUNNING' WHERE ticket_id = $1`, [ticket_id]);
    await db.query(`UPDATE md_machines SET current_status = 'RUNNING' WHERE machine_id = $1`, [machine_id]);
    await db.query('COMMIT');
    res.json({ success: true, log_id: rows[0].log_id });
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/shopfloor/finish', async (req, res) => {
  const { ticket_id, log_id, good_qty, scrap_qty, defect_id } = req.body;
  try {
    await db.query('BEGIN');

    // 1. Cập nhật nhật ký sản xuất
    await db.query(
      `UPDATE mes_production_logs
       SET end_time = NOW(), produced_good_qty = $1, produced_scrap_qty = $2
       WHERE log_id = $3`,
      [Number(good_qty), Number(scrap_qty), log_id]
    );

    // 2. Ghi nhận lỗi nếu có phế phẩm
    if (Number(scrap_qty) > 0 && defect_id) {
      await db.query(
        `INSERT INTO mes_defect_logs (log_id, defect_id, defect_qty) VALUES ($1, $2, $3)`,
        [log_id, defect_id, Number(scrap_qty)]
      );
    }

    // 3. Trả trạng thái máy về IDLE
    const { rows: machineRow } = await db.query(`SELECT machine_id FROM mes_production_logs WHERE log_id = $1`, [log_id]);
    if (machineRow.length > 0) {
      await db.query(`UPDATE md_machines SET current_status = 'IDLE' WHERE machine_id = $1`, [machineRow[0].machine_id]);
    }

    // 4. Cập nhật thẻ công đoạn
    const { rows: ticketRow } = await db.query(
      `UPDATE mes_job_tickets
       SET good_qty = COALESCE(good_qty, 0) + $1,
           scrap_qty = COALESCE(scrap_qty, 0) + $2,
           status = 'COMPLETED'
       WHERE ticket_id = $3
       RETURNING wo_id, step_order`,
      [Number(good_qty), Number(scrap_qty), ticket_id]
    );

    // 5. Kích hoạt chuyển tiếp dòng chảy WIP qua công đoạn kế tiếp
    if (ticketRow.length > 0) {
      await db.query('SELECT update_wip_flow($1::text, $2::int, $3::numeric, $4::numeric)', [
        ticketRow[0].wo_id,
        ticketRow[0].step_order,
        Number(good_qty),
        Number(scrap_qty)
      ]);
    }

    await db.query('COMMIT');
    res.json({ success: true, message: 'Ghi nhận sản lượng & tự động luân chuyển WIP thành công!' });
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. WIP, APS SCHEDULING & ANALYTICS APIs
// ==========================================

// Theo dõi tồn WIP theo từng công đoạn
app.get('/api/analytics/wip-flow', async (req, res) => {
  try {
    const query = `
      SELECT 
        w.wip_id, w.wo_id, w.step_order, w.in_qty, w.wip_qty, w.out_good_qty, w.out_scrap_qty,
        o.operation_name, o.department, p.product_name
      FROM mes_wip_inventory w
      JOIN md_operations o ON w.operation_id = o.operation_id
      JOIN mes_work_orders mwo ON w.wo_id = mwo.wo_id
      JOIN md_products p ON mwo.product_id = p.product_id
      ORDER BY w.wo_id, w.step_order ASC;
    `;
    const { rows } = await db.query(query);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Phân tích Pareto Top nguyên nhân lỗi QC
app.get('/api/analytics/defect-pareto', async (req, res) => {
  try {
    const query = `
      SELECT 
        d.defect_id,
        COALESCE(c.defect_name, d.defect_id) AS defect_name,
        COALESCE(c.defect_type, 'Gia Công') AS defect_type,
        SUM(d.defect_qty) AS total_qty
      FROM mes_defect_logs d
      LEFT JOIN md_defect_codes c ON d.defect_id = c.defect_id
      GROUP BY d.defect_id, c.defect_name, c.defect_type
      ORDER BY total_qty DESC;
    `;
    const { rows } = await db.query(query);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Năng suất & Hiệu suất theo Công nhân (Operator Productivity)
app.get('/api/analytics/operator-performance', async (req, res) => {
  try {
    const query = `
      SELECT 
        l.operator_code,
        COUNT(l.log_id) AS total_jobs,
        SUM(l.produced_good_qty) AS total_good,
        SUM(l.produced_scrap_qty) AS total_scrap,
        ROUND(SUM(EXTRACT(EPOCH FROM (l.end_time - l.start_time))) / 60.0, 1) AS total_working_minutes
      FROM mes_production_logs l
      WHERE l.end_time IS NOT NULL
      GROUP BY l.operator_code
      ORDER BY total_good DESC;
    `;
    const { rows } = await db.query(query);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Lập lịch APS tự động cân bằng chuyền theo ca
app.post('/api/aps/auto-schedule', async (req, res) => {
  const { wo_id, scheduled_date, shift_id } = req.body;
  try {
    await db.query('BEGIN');

    // Lấy thông tin ca làm việc
    const { rows: shiftRows } = await db.query('SELECT * FROM md_shifts WHERE shift_id = $1', [shift_id]);
    if (shiftRows.length === 0) throw new Error('Ca làm việc không hợp lệ');

    // Lấy các thẻ công đoạn chưa hoàn thành
    const { rows: tickets } = await db.query(
      `SELECT t.*, r.standard_time_minutes 
       FROM mes_job_tickets t
       JOIN mes_work_orders w ON t.wo_id = w.wo_id
       JOIN md_routings r ON w.product_id = r.product_id AND t.step_order = r.step_order
       WHERE t.wo_id = $1 ORDER BY t.step_order ASC`,
      [wo_id]
    );

    // Xóa lịch cũ nếu có
    await db.query('DELETE FROM mes_aps_schedules WHERE wo_id = $1', [wo_id]);

    // Gán máy mặc định theo từng phân xưởng
    const machineMapping = {
      10: 'MC-PRESS-01',
      20: 'MC-CNC-01',
      30: 'MC-WELD-01',
      40: 'MC-PAINT-01',
      50: 'MC-ASSY-01'
    };

    let startMinuteOffset = 0;
    for (const t of tickets) {
      const durationMinutes = (Number(t.target_qty) * Number(t.standard_time_minutes || 2)) / 60.0;
      const assignedMachine = machineMapping[t.step_order] || 'MC-PRESS-01';

      await db.query(
        `INSERT INTO mes_aps_schedules (wo_id, ticket_id, machine_id, shift_id, scheduled_date, assigned_operator, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'SCHEDULED')`,
        [wo_id, t.ticket_id, assignedMachine, shift_id, scheduled_date, 'NV-CHUYEN-TRUONG']
      );
      startMinuteOffset += durationMinutes;
    }

    await db.query('COMMIT');
    res.json({ success: true, message: `Lập lịch APS thành công cho lệnh ${wo_id} theo ${shiftRows[0].shift_name}!` });
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  }
});

// Lấy danh sách lịch điều độ APS
app.get('/api/aps/schedules', async (req, res) => {
  try {
    const query = `
      SELECT s.*, m.machine_name, sh.shift_name, t.target_qty, o.operation_name
      FROM mes_aps_schedules s
      JOIN md_machines m ON s.machine_id = m.machine_id
      JOIN md_shifts sh ON s.shift_id = sh.shift_id
      JOIN mes_job_tickets t ON s.ticket_id = t.ticket_id
      JOIN md_operations o ON t.operation_id = o.operation_id
      ORDER BY s.scheduled_date DESC, s.schedule_id ASC;
    `;
    const { rows } = await db.query(query);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API OEE Dashboard
app.get('/api/dashboard/oee', async (req, res) => {
  try {
    const query = `
      SELECT 
        m.machine_id,
        m.machine_name,
        m.current_status,
        m.ideal_cycle_time,
        COALESCE(SUM(l.produced_good_qty), 0) AS total_good,
        COALESCE(SUM(l.produced_scrap_qty), 0) AS total_scrap,
        COALESCE(SUM(EXTRACT(EPOCH FROM (l.end_time - l.start_time))), 0) AS total_operating_seconds
      FROM md_machines m
      LEFT JOIN mes_production_logs l ON m.machine_id = l.machine_id AND l.end_time IS NOT NULL
      GROUP BY m.machine_id, m.machine_name, m.current_status, m.ideal_cycle_time
      ORDER BY m.machine_id;
    `;
    const { rows } = await db.query(query);

    const oeeData = rows.map(m => {
      const totalParts = Number(m.total_good) + Number(m.total_scrap);
      const operatingTime = Number(m.total_operating_seconds);
      const idealCycle = Number(m.ideal_cycle_time) || 30;

      const availability = totalParts > 0 ? 0.95 : 0;
      let performance = 0;
      if (operatingTime > 0 && totalParts > 0) {
        performance = Math.min((totalParts * idealCycle) / operatingTime, 1.0);
      }
      const quality = totalParts > 0 ? Number(m.total_good) / totalParts : 0;
      const oee = (availability * performance * quality) * 100;

      return {
        machine_id: m.machine_id,
        machine_name: m.machine_name,
        current_status: m.current_status,
        total_good: Number(m.total_good),
        total_scrap: Number(m.total_scrap),
        availability: Math.round(availability * 100),
        performance: Math.round(performance * 100),
        quality: Math.round(quality * 100),
        oee: Math.round(oee)
      };
    });

    res.json({ success: true, data: oeeData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/dashboard/logs', async (req, res) => {
  try {
    const query = `
      SELECT l.*, o.operation_id, t.wo_id
      FROM mes_production_logs l
      JOIN mes_job_tickets t ON l.ticket_id = t.ticket_id
      JOIN md_operations o ON t.operation_id = o.operation_id
      ORDER BY l.log_id DESC
      LIMIT 10;
    `;
    const { rows } = await db.query(query);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// ==========================================
// 5. API MÔ PHỎNG SẢN XUẤT TỰ ĐỘNG (1-CLICK SIMULATOR)
// ==========================================
app.post('/api/simulator/run-auto', async (req, res) => {
  const simWoId = `SIM-WO-${Date.now().toString().slice(-4)}`;
  const planQty = 300;

  try {
    await db.query('BEGIN');

    // 1. Tạo Lệnh mô phỏng
    await db.query(
      `INSERT INTO mes_work_orders (wo_id, product_id, plan_quantity, planned_start_date, planned_due_date, status)
       VALUES ($1, 'FG-FRAME-01', $2, NOW(), NOW() + INTERVAL '5 days', 'RELEASED')`,
      [simWoId, planQty]
    );

    // 2. Cấp phát trừ tồn kho NVL theo BOM
    await db.query('SELECT allocate_wo_materials($1::text, $2::text, $3::numeric)', [
      simWoId, 'FG-FRAME-01', planQty
    ]);

    // 3. Khởi tạo Tickets và bảng luân chuyển WIP
    const stepsData = [
      { step: 10, op: 'OP_STAMP_01', mc: 'MC-PRESS-01', opCode: 'NV-088', good: 295, scrap: 5, defect: 'DEF_STAMP_BURR' },
      { step: 20, op: 'OP_CNC_MILL_01', mc: 'MC-CNC-01', opCode: 'NV-102', good: 290, scrap: 5, defect: 'DEF_CNC_DIM' },
      { step: 30, op: 'OP_WELD_01', mc: 'MC-WELD-01', opCode: 'NV-045', good: 288, scrap: 2, defect: 'DEF_WELD_POROSITY' },
      { step: 40, op: 'OP_PAINT_01', mc: 'MC-PAINT-01', opCode: 'NV-019', good: 285, scrap: 3, defect: 'DEF_PAINT_PEEL' },
      { step: 50, op: 'OP_ASSY_01', mc: 'MC-ASSY-01', opCode: 'NV-077', good: 285, scrap: 0, defect: null }
    ];

    for (let i = 0; i < stepsData.length; i++) {
      const s = stepsData[i];
      const ticketId = `${simWoId}-STEP${s.step}`;
      const inWip = i === 0 ? planQty : 0;

      await db.query(
        `INSERT INTO mes_job_tickets (ticket_id, wo_id, operation_id, step_order, target_qty, good_qty, scrap_qty, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'COMPLETED')`,
        [ticketId, simWoId, s.op, s.step, planQty, s.good, s.scrap]
      );

      await db.query(
        `INSERT INTO mes_wip_inventory (wo_id, operation_id, step_order, in_qty, wip_qty, out_good_qty, out_scrap_qty)
         VALUES ($1, $2, $3, $4, 0, $5, $6)`,
        [simWoId, s.op, s.step, inWip, s.good, s.scrap]
      );

      // Tạo log vận hành máy và ghi nhận lỗi
      const { rows: logRows } = await db.query(
        `INSERT INTO mes_production_logs (ticket_id, machine_id, operator_code, start_time, end_time, produced_good_qty, produced_scrap_qty)
         VALUES ($1, $2, $3, NOW() - INTERVAL '2 hours', NOW(), $4, $5) RETURNING log_id`,
        [ticketId, s.mc, s.opCode, s.good, s.scrap]
      );

      if (s.scrap > 0 && s.defect) {
        await db.query(
          `INSERT INTO mes_defect_logs (log_id, defect_id, defect_qty) VALUES ($1, $2, $3)`,
          [logRows[0].log_id, s.defect, s.scrap]
        );
      }
    }

    await db.query('COMMIT');
    res.json({
      success: true,
      simWoId: simWoId,
      message: `Đã chạy xong mô phỏng cho lệnh ${simWoId} với 5 công đoạn liên hoàn!`
    });
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`MES Server running on port ${PORT}`));