require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. MASTER DATA: SẢN PHẨM & NGUYÊN VẬT LIỆU
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

// 2. PHÁT LỆNH SẢN XUẤT + TỰ ĐỘNG XUẤT CẤP VẬT TƯ THEO BOM
app.post('/api/work-orders', async (req, res) => {
  const { wo_id, product_id, plan_quantity, planned_start_date, planned_due_date } = req.body;
  try {
    await db.query('BEGIN');

    // Tạo Work Order
    const woQuery = `
      INSERT INTO mes_work_orders (wo_id, product_id, plan_quantity, planned_start_date, planned_due_date, status)
      VALUES ($1, $2, $3, $4, $5, 'RELEASED') RETURNING *;
    `;
    await db.query(woQuery, [wo_id, product_id, plan_quantity, planned_start_date, planned_due_date]);

    // Tự động trừ tồn kho và cấp phát vật tư theo BOM
    await db.query('SELECT allocate_wo_materials($1, $2, $3)', [wo_id, product_id, plan_quantity]);

    // Lấy lưu trình Routing và sinh Job Tickets
    const routingQuery = `
      SELECT r.step_order, r.operation_id
      FROM md_routings r WHERE r.product_id = $1 ORDER BY r.step_order ASC;
    `;
    const { rows: steps } = await db.query(routingQuery, [product_id]);

    for (const step of steps) {
      const ticketId = `${wo_id}-STEP${step.step_order}`;
      await db.query(
        `INSERT INTO mes_job_tickets (ticket_id, wo_id, operation_id, step_order, target_qty, status)
         VALUES ($1, $2, $3, $4, $5, 'PENDING')`,
        [ticketId, wo_id, step.operation_id, step.step_order, plan_quantity]
      );
    }

    await db.query('COMMIT');
    res.json({ success: true, message: `Phát lệnh ${wo_id} thành công! Đã cấp phát NVL theo định mức BOM.` });
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

// 3. THAO TÁC XƯỞNG (SHOPFLOOR SCAN & PRODUCTION)
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
      [good_qty, scrap_qty, log_id]
    );

    if (scrap_qty > 0 && defect_id) {
      await db.query(
        `INSERT INTO mes_defect_logs (log_id, defect_id, defect_qty) VALUES ($1, $2, $3)`,
        [log_id, defect_id, scrap_qty]
      );
    }

    const { rows: machineRow } = await db.query(`SELECT machine_id FROM mes_production_logs WHERE log_id = $1`, [log_id]);
    if (machineRow.length > 0) {
      await db.query(`UPDATE md_machines SET current_status = 'IDLE' WHERE machine_id = $1`, [machineRow[0].machine_id]);
    }

    await db.query(
      `UPDATE mes_job_tickets
       SET good_qty = COALESCE(good_qty, 0) + $1,
           scrap_qty = COALESCE(scrap_qty, 0) + $2,
           status = 'COMPLETED'
       WHERE ticket_id = $3`,
      [good_qty, scrap_qty, ticket_id]
    );

    await db.query('COMMIT');
    res.json({ success: true, message: 'Hoàn thành ghi nhận sản lượng!' });
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. API TÍNH TOÁN OEE & HIỆU SUẤT THỜI GIAN THỰC (OEE CALCULATION)
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

      // 1. Availability (Mặc định 95% khi máy hoạt động bình thường)
      const availability = totalParts > 0 ? 0.95 : 0;

      // 2. Performance = (Tổng SP * Thời gian chu kỳ chuẩn) / Thời gian máy chạy thực tế
      let performance = 0;
      if (operatingTime > 0 && totalParts > 0) {
        performance = Math.min((totalParts * idealCycle) / operatingTime, 1.0);
      }

      // 3. Quality = Sản lượng Đạt (OK) / Tổng sản lượng (OK + NG)
      const quality = totalParts > 0 ? Number(m.total_good) / totalParts : 0;

      // OEE = A * P * Q
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`MES Server running on port ${PORT}`));