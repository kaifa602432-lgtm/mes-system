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
    const { rows } = await db.query('SELECT * FROM md_machines ORDER BY department, machine_id');
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
// 2. PHÁT LỆNH WO & CẤP PHÁT BOM
// ==========================================
app.post('/api/work-orders', async (req, res) => {
  const { wo_id, product_id, plan_quantity, planned_start_date, planned_due_date } = req.body;
  try {
    await db.query('BEGIN');
    const woQuery = `
      INSERT INTO mes_work_orders (wo_id, product_id, plan_quantity, planned_start_date, planned_due_date, status)
      VALUES ($1, $2, $3, $4, $5, 'RELEASED') RETURNING *;
    `;
    await db.query(woQuery, [wo_id, product_id, Number(plan_quantity), planned_start_date, planned_due_date]);
    await db.query('SELECT allocate_wo_materials($1::text, $2::text, $3::numeric)', [
      String(wo_id), String(product_id), Number(plan_quantity)
    ]);

    const routingQuery = `SELECT r.step_order, r.operation_id FROM md_routings r WHERE r.product_id = $1 ORDER BY r.step_order ASC;`;
    const { rows: steps } = await db.query(routingQuery, [product_id]);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const ticketId = `${wo_id}-STEP${step.step_order}`;
      await db.query(
        `INSERT INTO mes_job_tickets (ticket_id, wo_id, operation_id, step_order, target_qty, status)
         VALUES ($1, $2, $3, $4, $5, 'PENDING')
         ON CONFLICT (ticket_id) DO UPDATE SET target_qty = EXCLUDED.target_qty`,
        [ticketId, wo_id, step.operation_id, step.step_order, Number(plan_quantity)]
      );

      const initialIn = i === 0 ? Number(plan_quantity) : 0;
      await db.query(
        `INSERT INTO mes_wip_inventory (wo_id, operation_id, step_order, in_qty, wip_qty, out_good_qty, out_scrap_qty)
         VALUES ($1, $2, $3, $4, $4, 0, 0)
         ON CONFLICT (wo_id, step_order) DO UPDATE SET in_qty = EXCLUDED.in_qty, wip_qty = EXCLUDED.wip_qty`,
        [wo_id, step.operation_id, step.step_order, initialIn]
      );
    }

    await db.query('COMMIT');
    res.json({ success: true, message: `Phát lệnh ${wo_id} thành công! Đã trừ định mức NVL và tạo ${steps.length} thẻ QR.` });
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
// 3. THAO TÁC XƯỞNG
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
    await db.query(
      `UPDATE mes_production_logs
       SET end_time = NOW(), produced_good_qty = $1, produced_scrap_qty = $2
       WHERE log_id = $3`,
      [Number(good_qty), Number(scrap_qty), log_id]
    );

    if (Number(scrap_qty) > 0 && defect_id) {
      await db.query(
        `INSERT INTO mes_defect_logs (log_id, defect_id, defect_qty) VALUES ($1, $2, $3)`,
        [log_id, defect_id, Number(scrap_qty)]
      );
    }

    const { rows: machineRow } = await db.query(`SELECT machine_id FROM mes_production_logs WHERE log_id = $1`, [log_id]);
    if (machineRow.length > 0) {
      await db.query(`UPDATE md_machines SET current_status = 'IDLE' WHERE machine_id = $1`, [machineRow[0].machine_id]);
    }

    const { rows: ticketRow } = await db.query(
      `UPDATE mes_job_tickets
       SET good_qty = COALESCE(good_qty, 0) + $1,
           scrap_qty = COALESCE(scrap_qty, 0) + $2,
           status = 'COMPLETED'
       WHERE ticket_id = $3
       RETURNING wo_id, step_order`,
      [Number(good_qty), Number(scrap_qty), ticket_id]
    );

    if (ticketRow.length > 0) {
      await db.query('SELECT update_wip_flow($1::text, $2::int, $3::numeric, $4::numeric)', [
        ticketRow[0].wo_id,
        ticketRow[0].step_order,
        Number(good_qty),
        Number(scrap_qty)
      ]);
    }

    await db.query('COMMIT');
    res.json({ success: true, message: 'Ghi nhận sản lượng & luân chuyển WIP thành công!' });
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. ANALYTICS & APS
// ==========================================
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

app.get('/api/analytics/incidents', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM mes_incident_logs ORDER BY incident_id DESC LIMIT 15');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// NÂNG CẤP THUẬT TOÁN APS: TÍNH TẢI MÁY, NĂNG SUẤT NHÂN SỰ & CẢNH BÁO QUÁ TẢI
app.post('/api/aps/auto-schedule', async (req, res) => {
  const { wo_id, scheduled_date, shift_id } = req.body;
  try {
    await db.query('BEGIN');

    const { rows: shiftRows } = await db.query('SELECT * FROM md_shifts WHERE shift_id = $1', [shift_id]);
    if (shiftRows.length === 0) throw new Error('Ca làm việc không hợp lệ');
    const shiftMinutes = Number(shiftRows[0].working_hours) * 60; // ~435 phút

    const { rows: woRows } = await db.query('SELECT * FROM mes_work_orders WHERE wo_id = $1', [wo_id]);
    if (woRows.length === 0) throw new Error('Không tìm thấy lệnh sản xuất');
    const targetQty = Number(woRows[0].plan_quantity);

    const { rows: tickets } = await db.query(
      `SELECT t.*, r.standard_time_minutes, o.operation_name, o.department
       FROM mes_job_tickets t
       JOIN mes_work_orders w ON t.wo_id = w.wo_id
       JOIN md_routings r ON w.product_id = r.product_id AND t.step_order = r.step_order
       JOIN md_operations o ON t.operation_id = o.operation_id
       WHERE t.wo_id = $1 ORDER BY t.step_order ASC`,
      [wo_id]
    );

    await db.query('DELETE FROM mes_aps_schedules WHERE wo_id = $1', [wo_id]);

    const machineMapping = {
      10: { mc: 'MC-PRESS-01', eff: 0.85, opCode: 'NV-088', opEff: 0.95 },
      20: { mc: 'MC-CNC-01',   eff: 0.75, opCode: 'NV-102', opEff: 0.90 },
      30: { mc: 'MC-WELD-01',  eff: 0.80, opCode: 'NV-045', opEff: 0.85 },
      40: { mc: 'MC-PAINT-01', eff: 0.90, opCode: 'NV-019', opEff: 0.95 },
      50: { mc: 'MC-ASSY-01',  eff: 0.95, opCode: 'NV-077', opEff: 0.90 }
    };

    const scheduleResults = [];
    let bottleneckFound = false;

    for (const t of tickets) {
      const cfg = machineMapping[t.step_order] || { mc: 'MC-PRESS-01', eff: 0.8, opCode: 'NV-088', opEff: 0.9 };
      
      const { rows: mcRows } = await db.query('SELECT ideal_cycle_time, machine_name FROM md_machines WHERE machine_id = $1', [cfg.mc]);
      const cycleTimeSec = mcRows.length > 0 ? Number(mcRows[0].ideal_cycle_time) : 30;

      const combinedEfficiency = cfg.eff * cfg.opEff;
      const requiredMinutes = Math.round(((targetQty * cycleTimeSec) / 60.0) / combinedEfficiency);

      const loadPercent = Math.round((requiredMinutes / shiftMinutes) * 100);
      const isOverloaded = loadPercent > 100;
      if (isOverloaded) bottleneckFound = true;

      const scheduleStatus = isOverloaded ? 'OVERLOAD_FULL' : 'OPTIMIZED';

      await db.query(
        `INSERT INTO mes_aps_schedules (wo_id, ticket_id, machine_id, shift_id, scheduled_date, assigned_operator, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [wo_id, t.ticket_id, cfg.mc, shift_id, scheduled_date, cfg.opCode, scheduleStatus]
      );

      scheduleResults.push({
        step_order: t.step_order,
        operation_name: t.operation_name,
        machine_id: cfg.mc,
        machine_name: mcRows[0]?.machine_name,
        operator_code: cfg.opCode,
        machine_oee: Math.round(cfg.eff * 100),
        operator_eff: Math.round(cfg.opEff * 100),
        required_minutes: requiredMinutes,
        shift_minutes: shiftMinutes,
        load_percent: loadPercent,
        status: scheduleStatus
      });
    }

    if (bottleneckFound) {
      await db.query(`
        INSERT INTO mes_incident_logs (incident_code, incident_name, category, severity, affected_wo_id, description, action_taken)
        VALUES ('APS_CAPACITY_OVERLOAD', 'Quá tải công suất điều độ APS cho lệnh ' || $1, 'APS_SCHEDULING', 'CRITICAL', $1,
                'Tổng thời gian gia công vượt quá công suất định mức 1 ca. Điểm nghẽn nghiêm trọng tại Xưởng CNC.',
                'Khuyến nghị: Tăng thêm Ca 2 & Ca 3 hoặc kích hoạt chạy song song MC-CNC-02, MC-CNC-03')
      `, [wo_id]);
    }

    await db.query('COMMIT');
    res.json({
      success: true,
      message: `Đã tính toán điều độ APS cho lệnh ${wo_id}! (Tải lớn nhất: ${Math.max(...scheduleResults.map(s => s.load_percent))}%)`,
      data: scheduleResults
    });
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  }
});

// API Phân tích Năng lực Thiết bị & Đề xuất Đầu tư CapEx (Động theo máy hỏng và lệnh)
app.get('/api/aps/capacity-analysis/:woId', async (req, res) => {
  const { woId } = req.params;
  try {
    const { rows: wo } = await db.query('SELECT plan_quantity FROM mes_work_orders WHERE wo_id = $1', [woId]);
    const qty = wo.length > 0 ? Number(wo[0].plan_quantity) : 300;

    const { rows: brokenMachines } = await db.query(
      `SELECT machine_id, department FROM md_machines WHERE current_status = 'BREAKDOWN'`
    );
    const brokenPress = brokenMachines.some(m => m.machine_id === 'MC-PRESS-01');

    const analysis = [
      {
        dept: 'Xưởng Dập',
        current_machines: brokenPress ? 2 : 3,
        cycle: 15,
        current_capacity_shift: brokenPress ? 1000 : 1500,
        demand: qty,
        load: Math.round((qty / (brokenPress ? 1000 : 1500)) * 100),
        suggestion: brokenPress ? 'CẢNH BÁO: Máy dập 160T hỏng! Cần chuyển khuôn qua máy thủy lực 250T' : (qty > 1500 ? 'Quá tải dập, cần tăng ca' : 'Đủ công suất (Sẵn sàng)')
      },
      {
        dept: 'Xưởng CNC',
        current_machines: 1,
        cycle: 45,
        current_capacity_shift: 500,
        demand: qty,
        load: Math.round((qty / 500) * 100),
        suggestion: qty > 500 ? `ĐIỂM NGHẼN CNC (${Math.round((qty/500)*100)}%): Cần đầu tư thêm ${Math.ceil(qty/500) - 1} máy CNC hoặc tăng ${Math.ceil(qty/500)} ca` : 'Đủ tải công suất'
      },
      {
        dept: 'Xưởng Hàn',
        current_machines: 2,
        cycle: 50,
        current_capacity_shift: 800,
        demand: qty,
        load: Math.round((qty / 800) * 100),
        suggestion: qty > 800 ? 'Tải cao: Cần kích hoạt thêm Robot Hàn OTC 02' : 'Đủ công suất'
      },
      {
        dept: 'Xưởng Sơn',
        current_machines: 2,
        cycle: 30,
        current_capacity_shift: 1200,
        demand: qty,
        load: Math.round((qty / 1200) * 100),
        suggestion: qty > 1200 ? 'Cần tăng tốc độ băng chuyền buồng sơn' : 'Đủ công suất'
      },
      {
        dept: 'Xưởng Lắp Ráp',
        current_machines: 2,
        cycle: 20,
        current_capacity_shift: 1300,
        demand: qty,
        load: Math.round((qty / 1300) * 100),
        suggestion: qty > 1300 ? 'Cần bổ sung bàn gá lắp ráp phụ trợ' : 'Đủ công suất'
      }
    ];

    res.json({ success: true, data: analysis });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API Phân tích Cân bằng Nhân lực (Headcount & Manpower Planning)
app.get('/api/analytics/manpower-analysis', async (req, res) => {
  try {
    const { rows: absentInc } = await db.query(
      `SELECT * FROM mes_incident_logs WHERE incident_code = 'INC_LABOR_ABSENT' AND status = 'OPEN'`
    );
    const isLaborAbsent = absentInc.length > 0;

    const { rows: demandRows } = await db.query(`
      SELECT COALESCE(SUM(plan_quantity), 0) as total_demand 
      FROM mes_work_orders 
      WHERE status IN ('RELEASED', 'RUNNING')
    `);
    const totalQty = Number(demandRows[0].total_demand) || 300;

    const departments = [
      { dept: 'Xưởng Dập', workers: 4, cycle: 15, eff: 0.95, shiftMin: 435 },
      { dept: 'Xưởng CNC', workers: 3, cycle: 45, eff: 0.90, shiftMin: 435 },
      { dept: 'Xưởng Hàn', workers: isLaborAbsent ? 1 : 4, cycle: 60, eff: 0.85, shiftMin: 435 },
      { dept: 'Xưởng Sơn', workers: 3, cycle: 30, eff: 0.95, shiftMin: 435 },
      { dept: 'Xưởng Lắp Ráp', workers: 6, cycle: 20, eff: 0.90, shiftMin: 435 }
    ];

    const manpowerReport = departments.map(d => {
      const minutesNeeded = Math.round((totalQty * d.cycle) / (60.0 * d.eff));
      const currentCapacityMinutes = d.workers * d.shiftMin;
      const workersRequired = Math.max(1, Math.ceil(minutesNeeded / d.shiftMin));
      const workerGap = workersRequired - d.workers;
      const loadPercent = Math.round((minutesNeeded / currentCapacityMinutes) * 100);

      let action = 'Đủ nhân sự (Cân bằng tối ưu)';
      if (workerGap > 0) {
        action = `THIẾU ${workerGap} CÔNG NHÂN (Cần điều động thêm hoặc tăng ${Math.ceil(workerGap / d.workers)} ca)`;
      } else if (workerGap < 0 && loadPercent < 50) {
        action = `DƯ ${Math.abs(workerGap)} CÔNG NHÂN (Có thể điều chuyển hỗ trợ xưởng khác)`;
      }

      return {
        department: d.dept,
        current_workers: d.workers,
        total_demand_qty: totalQty,
        minutes_needed: minutesNeeded,
        workers_required: workersRequired,
        worker_gap: workerGap,
        load_percent: loadPercent,
        status: workerGap > 0 ? 'DEFICIT' : (loadPercent >= 50 && loadPercent <= 100 ? 'BALANCED' : 'SURPLUS'),
        recommendation: action
      };
    });

    res.json({ success: true, total_demand: totalQty, is_incident: isLaborAbsent, data: manpowerReport });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

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

app.get('/api/dashboard/oee', async (req, res) => {
  try {
    const query = `
      SELECT 
        m.machine_id,
        m.machine_name,
        m.department,
        m.current_status,
        m.ideal_cycle_time,
        COALESCE(SUM(l.produced_good_qty), 0) AS total_good,
        COALESCE(SUM(l.produced_scrap_qty), 0) AS total_scrap,
        COALESCE(SUM(EXTRACT(EPOCH FROM (l.end_time - l.start_time))), 0) AS total_operating_seconds
      FROM md_machines m
      LEFT JOIN mes_production_logs l ON m.machine_id = l.machine_id AND l.end_time IS NOT NULL
      GROUP BY m.machine_id, m.machine_name, m.department, m.current_status, m.ideal_cycle_time
      ORDER BY m.department, m.machine_id;
    `;
    const { rows } = await db.query(query);

    const oeeData = rows.map(m => {
      const totalParts = Number(m.total_good) + Number(m.total_scrap);
      const operatingTime = Number(m.total_operating_seconds);
      const idealCycle = Number(m.ideal_cycle_time) || 30;

      const availability = m.current_status === 'BREAKDOWN' ? 0.35 : (totalParts > 0 ? 0.95 : 0);
      let performance = 0;
      if (operatingTime > 0 && totalParts > 0) {
        performance = Math.min((totalParts * idealCycle) / operatingTime, 1.0);
      }
      const quality = totalParts > 0 ? Number(m.total_good) / totalParts : 0;
      const oee = (availability * performance * quality) * 100;

      return {
        machine_id: m.machine_id,
        machine_name: m.machine_name,
        department: m.department,
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

// =========================================================================
// 5. TRUNG TÂM GIẢ LẬP SỰ CỐ & STRESS-TEST
// =========================================================================

// Sự cố 1: Thiếu máy / Nghẽn phôi CNC
app.post('/api/simulator/scenario/lack-machine', async (req, res) => {
  try {
    const simWoId = `WO-BOTTLENECK-${Date.now().toString().slice(-4)}`;
    await db.query('BEGIN');
    await db.query(`INSERT INTO mes_work_orders (wo_id, product_id, plan_quantity, status) VALUES ($1, 'FG-FRAME-01', 800, 'RELEASED')`, [simWoId]);
    await db.query(`INSERT INTO mes_wip_inventory (wo_id, operation_id, step_order, in_qty, wip_qty, out_good_qty) VALUES ($1, 'OP_STAMP_01', 10, 800, 0, 800)`, [simWoId]);
    await db.query(`INSERT INTO mes_wip_inventory (wo_id, operation_id, step_order, in_qty, wip_qty, out_good_qty) VALUES ($1, 'OP_CNC_MILL_01', 20, 800, 800, 0)`, [simWoId]);
    await db.query(`
      INSERT INTO mes_incident_logs (incident_code, incident_name, category, severity, affected_wo_id, affected_machine_id, description, action_taken, status)
      VALUES ('INC_NO_CAPACITY', 'Thiếu máy phay CNC - Ứ đọng 800 phôi', 'MACHINE', 'CRITICAL', $1, 'MC-CNC-01', 'Thời gian gia công CNC dài (45s/sp) gây thắt cổ chai toàn bộ dây chuyền', 'Cần kích hoạt thêm MC-CNC-02 và MC-CNC-03 để chia tải', 'OPEN')
    `, [simWoId]);
    await db.query('COMMIT');
    res.json({ success: true, message: 'Đã kích hoạt sự cố: TẮC NGHẼN CỔ CHAI XƯỞNG CNC (800 PCS đang chờ)!' });
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  }
});

// Sự cố 2: Đang sản xuất máy hỏng đột ngột
app.post('/api/simulator/scenario/machine-breakdown', async (req, res) => {
  try {
    await db.query('BEGIN');
    await db.query(`UPDATE md_machines SET current_status = 'BREAKDOWN' WHERE machine_id = 'MC-PRESS-01'`);
    await db.query(`
      INSERT INTO mes_incident_logs (incident_code, incident_name, category, severity, affected_machine_id, description, action_taken, status)
      VALUES ('INC_BREAKDOWN', 'Hư hỏng máy dập 160T AIDA', 'MACHINE', 'CRITICAL', 'MC-PRESS-01', 'Kẹt trục khuỷu và rò rỉ dầu thủy lực khi đang dập hàng', 'Phát tín hiệu ANDON Đỏ - Chuyển sang máy dập 250T', 'OPEN')
    `);
    await db.query('COMMIT');
    res.json({ success: true, message: 'Đã kích hoạt sự cố: MÁY DẬP MC-PRESS-01 BỊ HỎNG (Chuyển trạng thái BREAKDOWN & phát ANDON Đỏ)!' });
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  }
});

// Sự cố 3: Thiếu nguyên vật liệu
app.post('/api/simulator/scenario/material-shortage', async (req, res) => {
  try {
    await db.query('BEGIN');
    await db.query(`UPDATE md_materials SET current_stock = 45 WHERE material_id = 'MAT-COIL-01'`);
    await db.query(`
      INSERT INTO mes_incident_logs (incident_code, incident_name, category, severity, description, action_taken, status)
      VALUES ('INC_MAT_SHORTAGE', 'Cạn kiệt Tôn cuộn SS400 (Chỉ còn 45kg)', 'MATERIAL', 'CRITICAL', 'Lô tôn cuộn nhập khẩu bị trễ hải quan, tồn kho thấp hơn mức an toàn 5000kg', 'Khóa phát lệnh mới cho các mã thân vỏ, chuyển lịch sản xuất các mã dùng ống thép', 'OPEN')
    `);
    await db.query('COMMIT');
    res.json({ success: true, message: 'Đã kích hoạt sự cố: CẠN KIỆT TỒN KHO TÔN CUỘN SS400 (Dưới ngưỡng an toàn)!' });
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  }
});

// Sự cố 4: Công nhân nghỉ đột xuất
app.post('/api/simulator/scenario/labor-absent', async (req, res) => {
  try {
    await db.query(`
      INSERT INTO mes_incident_logs (incident_code, incident_name, category, severity, description, action_taken, status)
      VALUES ('INC_LABOR_ABSENT', '3 Công nhân bậc cao xưởng Hàn vắng mặt', 'MANPOWER', 'CRITICAL', 'Ca 1 thiếu 3 thợ hàn MIG/MAG bậc 4/7 khiến xưởng Hàn chỉ còn 1 thợ', 'Kích hoạt cảnh báo thiếu hụt nhân lực - Cần điều chuyển gấp thợ hàn dự phòng', 'OPEN')
    `);
    res.json({ success: true, message: 'Đã kích hoạt sự cố: THIẾU NHÂN SỰ XƯỞNG HÀN (Chỉ còn 1 thợ, thiếu 3 người)!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Sự cố 5: Đột biến tăng đơn hàng khẩn cấp
app.post('/api/simulator/scenario/rush-order', async (req, res) => {
  try {
    const rushWo = `WO-RUSH-${Date.now().toString().slice(-4)}`;
    await db.query('BEGIN');
    await db.query(`
      INSERT INTO mes_work_orders (wo_id, product_id, plan_quantity, planned_start_date, planned_due_date, status)
      VALUES ($1, 'FG-FRAME-01', 1500, NOW(), NOW() + INTERVAL '2 days', 'RELEASED')
    `, [rushWo]);
    await db.query(`
      INSERT INTO mes_incident_logs (incident_code, incident_name, category, severity, affected_wo_id, description, action_taken, status)
      VALUES ('INC_RUSH_ORDER', 'Đơn hàng khẩn cấp 1,500 PCS trong 48h', 'RUSH_ORDER', 'CRITICAL', $1, 'Khách hàng FDI yêu cầu xuất gấp 1,500 khung máy trong 2 ngày', 'Cần chạy APS tăng ca 3 (Ca đêm) và kích hoạt toàn bộ 14 máy trong nhà xưởng', 'OPEN')
    `, [rushWo]);
    await db.query('COMMIT');
    res.json({ success: true, message: `Đã kích hoạt sự cố: ĐƠN HÀNG KHẨN ${rushWo} (1,500 PCS - Yêu cầu tái lập lịch APS đa ca)!` });
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  }
});

// Sự cố 6: Lỗi chất lượng hàng loạt
app.post('/api/simulator/scenario/mass-defect', async (req, res) => {
  try {
    await db.query('BEGIN');
    const { rows: logRows } = await db.query(`
      INSERT INTO mes_production_logs (ticket_id, machine_id, operator_code, start_time, end_time, produced_good_qty, produced_scrap_qty)
      VALUES ('WO-2026-NORMAL-STEP40', 'MC-PAINT-01', 'NV-019', NOW() - INTERVAL '1 hour', NOW(), 120, 80)
      RETURNING log_id
    `);
    await db.query(`
      INSERT INTO mes_defect_logs (log_id, defect_id, defect_qty)
      VALUES ($1, 'DEF_PAINT_PEEL', 80)
    `, [logRows[0].log_id]);
    await db.query(`
      INSERT INTO mes_incident_logs (incident_code, incident_name, category, severity, affected_machine_id, description, action_taken, status)
      VALUES ('INC_MASS_DEFECT', 'Phế phẩm hàng loạt tại Xưởng Sơn (80 PCS hỏng)', 'QUALITY', 'CRITICAL', 'MC-PAINT-01', 'Nhiệt độ sấy không đủ làm lớp sơn tĩnh điện bị bong tróc diện rộng', 'Tạm dừng chuyền sơn, xả bỏ dung dịch tẩy rửa và điều chỉnh đường đặc tính nhiệt lò sấy', 'OPEN')
    `);
    await db.query('COMMIT');
    res.json({ success: true, message: 'Đã kích hoạt sự cố: LỖI HÀNG LOẠT 80 PCS PHẾ PHẨM SƠN (Đẩy tỷ lệ lỗi lên Pareto)!' });
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  }
});

// ĐẨY TẢI CỰC ĐẠI: NẠP 4 ĐƠN HÀNG HÀNG LOẠT (11,300 PCS)
app.post('/api/simulator/flood-orders', async (req, res) => {
  try {
    await db.query('BEGIN');
    const floodBatch = [
      { id: `WO-MASS-01`, qty: 2500, days: 3 },
      { id: `WO-MASS-02`, qty: 3000, days: 4 },
      { id: `WO-MASS-03`, qty: 1800, days: 2 },
      { id: `WO-MASS-04`, qty: 4000, days: 5 }
    ];

    for (const wo of floodBatch) {
      await db.query(
        `INSERT INTO mes_work_orders (wo_id, product_id, plan_quantity, planned_start_date, planned_due_date, status)
         VALUES ($1, 'FG-FRAME-01', $2, NOW(), NOW() + ($3 || ' days')::INTERVAL, 'RELEASED')
         ON CONFLICT (wo_id) DO UPDATE SET plan_quantity = EXCLUDED.plan_quantity, status = 'RELEASED'`,
        [wo.id, wo.qty, wo.days]
      );

      const routingQuery = `SELECT step_order, operation_id FROM md_routings WHERE product_id = 'FG-FRAME-01' ORDER BY step_order ASC;`;
      const { rows: steps } = await db.query(routingQuery);
      for (const step of steps) {
        await db.query(
          `INSERT INTO mes_job_tickets (ticket_id, wo_id, operation_id, step_order, target_qty, status)
           VALUES ($1, $2, $3, $4, $5, 'PENDING')
           ON CONFLICT (ticket_id) DO UPDATE SET target_qty = EXCLUDED.target_qty`,
          [`${wo.id}-STEP${step.step_order}`, wo.id, step.operation_id, step.step_order, wo.qty]
        );
      }
    }

    await db.query(`
      INSERT INTO mes_incident_logs (incident_code, incident_name, category, severity, description, action_taken, status)
      VALUES ('MASS_ORDER_SPIKE', 'Đột biến nạp 4 Lệnh sản xuất cực lớn (11,300 PCS)', 'RUSH_ORDER', 'CRITICAL',
              'Nhà máy tiếp nhận đồng loạt 4 dự án lớn vượt 400% công suất thiết kế thông thường',
              'Cần chạy bài toán cân bằng nhân lực (Manpower Loading) và kích hoạt chế độ làm việc 3 ca liên tục', 'OPEN')
    `);

    await db.query('COMMIT');
    res.json({ success: true, message: 'Đã nạp thành công 4 đơn hàng cực lớn với tổng sản lượng 11,300 PCS!' });
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  }
});

// SIÊU MÔ PHỎNG KHỦNG HOẢNG TỔNG HỢP
app.post('/api/simulator/scenario/mega-crisis', async (req, res) => {
  const crisisWo = `CRISIS-WO-${Date.now().toString().slice(-4)}`;
  try {
    await db.query('BEGIN');

    await db.query(
      `INSERT INTO mes_work_orders (wo_id, product_id, plan_quantity, status) VALUES ($1, 'FG-FRAME-01', 2000, 'RELEASED')`,
      [crisisWo]
    );

    const routingSteps = [
      { step: 10, op: 'OP_STAMP_01' },
      { step: 20, op: 'OP_CNC_MILL_01' },
      { step: 30, op: 'OP_WELD_01' },
      { step: 40, op: 'OP_PAINT_01' },
      { step: 50, op: 'OP_ASSY_01' }
    ];

    for (const r of routingSteps) {
      await db.query(
        `INSERT INTO mes_job_tickets (ticket_id, wo_id, operation_id, step_order, target_qty, status)
         VALUES ($1, $2, $3, $4, 2000, 'RUNNING')
         ON CONFLICT (ticket_id) DO NOTHING`,
        [`${crisisWo}-STEP${r.step}`, crisisWo, r.op, r.step]
      );
    }

    await db.query(`UPDATE md_machines SET current_status = 'BREAKDOWN' WHERE machine_id = 'MC-PRESS-01'`);
    
    await db.query(
      `INSERT INTO mes_wip_inventory (wo_id, operation_id, step_order, in_qty, wip_qty, out_good_qty) VALUES ($1, 'OP_STAMP_01', 10, 2000, 0, 1900)
       ON CONFLICT (wo_id, step_order) DO UPDATE SET wip_qty = 0, out_good_qty = 1900`,
      [crisisWo]
    );
    await db.query(
      `INSERT INTO mes_wip_inventory (wo_id, operation_id, step_order, in_qty, wip_qty, out_good_qty) VALUES ($1, 'OP_CNC_MILL_01', 20, 1900, 1600, 300)
       ON CONFLICT (wo_id, step_order) DO UPDATE SET in_qty = 1900, wip_qty = 1600, out_good_qty = 300`,
      [crisisWo]
    );

    const { rows: l1 } = await db.query(
      `INSERT INTO mes_production_logs (ticket_id, machine_id, operator_code, start_time, end_time, produced_good_qty, produced_scrap_qty)
       VALUES ($1, 'MC-PRESS-02', 'NV-088', NOW() - INTERVAL '3 hours', NOW(), 1900, 100) RETURNING log_id`,
      [`${crisisWo}-STEP10`]
    );
    await db.query(`INSERT INTO mes_defect_logs (log_id, defect_id, defect_qty) VALUES ($1, 'DEF_STAMP_BURR', 100)`, [l1[0].log_id]);

    const { rows: l2 } = await db.query(
      `INSERT INTO mes_production_logs (ticket_id, machine_id, operator_code, start_time, end_time, produced_good_qty, produced_scrap_qty)
       VALUES ($1, 'MC-WELD-01', 'NV-045', NOW() - INTERVAL '2 hours', NOW(), 280, 50) RETURNING log_id`,
      [`${crisisWo}-STEP30`]
    );
    await db.query(`INSERT INTO mes_defect_logs (log_id, defect_id, defect_qty) VALUES ($1, 'DEF_WELD_POROSITY', 50)`, [l2[0].log_id]);

    await db.query(`
      INSERT INTO mes_incident_logs (incident_code, incident_name, category, severity, description, action_taken, status) VALUES
      ('CRISIS_OVERLOAD', 'Quá tải dây chuyền (2,000 PCS) & Tắc nghẽn CNC', 'RUSH_ORDER', 'CRITICAL', 'Đơn hàng lớn vượt 250% công suất bình thường gây quá tải toàn bộ các trạm', 'Kích hoạt phương án khẩn cấp: Tăng 3 ca sản xuất, huy động toàn bộ 14 máy', 'OPEN'),
      ('CRISIS_MC_DOWN', 'Hư hỏng máy dập chính MC-PRESS-01', 'MACHINE', 'CRITICAL', 'Máy dập 160T dừng do đứt xích truyền động', 'Chuyển toàn bộ khuôn dập sang máy dự phòng MC-PRESS-02 (250T)', 'OPEN'),
      ('CRISIS_DEFECT', 'Tỷ lệ phế phẩm tăng vọt tại xưởng Dập & Hàn', 'QUALITY', 'CRITICAL', 'Gia công gấp dẫn đến sai lệch thông số ép và rỗ khí mối hàn', 'Dừng 15 phút hiệu chỉnh robot hàn và thay dao tiện CNC', 'OPEN')
    `);

    await db.query('COMMIT');
    res.json({
      success: true,
      message: `💥 ĐÃ KÍCH HOẠT SIÊU MÔ PHỎNG TỔNG HỢP: Đơn ${crisisWo} (2,000 PCS) + Hỏng máy dập + Nghẽn 1,600 phôi CNC + 150 lỗi phế phẩm!`
    });
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  }
});

// Phục hồi hệ thống về trạng thái ban đầu sạch sẽ & CÂN BẰNG TỐI ƯU (300 PCS)
app.post('/api/simulator/reset-all', async (req, res) => {
  try {
    await db.query('BEGIN');
    
    // 1. Phục hồi trạng thái máy móc
    await db.query(`UPDATE md_machines SET current_status = 'IDLE'`);
    
    // 2. Phục hồi kho vật tư
    await db.query(`UPDATE md_materials SET current_stock = 25000 WHERE material_id = 'MAT-COIL-01'`);
    await db.query(`UPDATE md_materials SET current_stock = 2000 WHERE material_id = 'MAT-PIPE-02'`);
    await db.query(`UPDATE md_materials SET current_stock = 850 WHERE material_id = 'MAT-PAINT-BLK'`);
    await db.query(`UPDATE md_materials SET current_stock = 5000 WHERE material_id = 'MAT-BOLT-M8'`);

    // 3. XÓA SẠCH DỮ LIỆU LỖI & NHẬT KÝ SỰ CỐ
    await db.query(`DELETE FROM mes_defect_logs`);
    await db.query(`DELETE FROM mes_incident_logs`);
    await db.query(`DELETE FROM mes_production_logs`);
    await db.query(`DELETE FROM mes_aps_schedules`);
    
    // 4. Xóa các đơn mô phỏng bất thường
    await db.query(`DELETE FROM mes_work_orders WHERE wo_id LIKE 'WO-MASS%' OR wo_id LIKE 'CRISIS%' OR wo_id LIKE 'WO-RUSH%' OR wo_id LIKE 'WO-BOTTLENECK%'`);
    
    // 5. Thiết lập 1 lệnh chuẩn duy nhất (300 PCS)
    await db.query(`
      INSERT INTO mes_work_orders (wo_id, product_id, plan_quantity, status)
      VALUES ('WO-2026-NORMAL', 'FG-FRAME-01', 300, 'RELEASED')
      ON CONFLICT (wo_id) DO UPDATE SET plan_quantity = 300, status = 'RELEASED'
    `);

    // Phục hồi dòng WIP sạch sẽ
    await db.query(`DELETE FROM mes_wip_inventory WHERE wo_id != 'WO-2026-NORMAL'`);
    await db.query(`
      INSERT INTO mes_wip_inventory (wo_id, operation_id, step_order, in_qty, wip_qty, out_good_qty, out_scrap_qty)
      VALUES 
      ('WO-2026-NORMAL', 'OP_STAMP_01', 10, 300, 300, 0, 0),
      ('WO-2026-NORMAL', 'OP_CNC_MILL_01', 20, 0, 0, 0, 0),
      ('WO-2026-NORMAL', 'OP_WELD_01', 30, 0, 0, 0, 0),
      ('WO-2026-NORMAL', 'OP_PAINT_01', 40, 0, 0, 0, 0),
      ('WO-2026-NORMAL', 'OP_ASSY_01', 50, 0, 0, 0, 0)
      ON CONFLICT (wo_id, step_order) DO UPDATE SET in_qty = EXCLUDED.in_qty, wip_qty = EXCLUDED.wip_qty, out_good_qty = 0, out_scrap_qty = 0
    `);

    await db.query('COMMIT');
    res.json({ success: true, message: 'Đã phục hồi xưởng về trạng thái CHUẨN: Xóa toàn bộ lỗi, máy sẵn sàng, nhân lực cân bằng!' });
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`MES Industrial Server running on port ${PORT}`));