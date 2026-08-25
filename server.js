require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. API MASTER DATA: SẢN PHẨM & NGUYÊN VẬT LIỆU
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

// 2. API MASTER DATA: BOM (BILL OF MATERIALS)
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
      ORDER BY b.bom_id
    `;
    const { rows } = await db.query(query, [productId]);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. API MASTER DATA: MÁY MÓC & THIẾT BỊ
app.get('/api/machines', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM md_machines ORDER BY machine_id');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. API TẠO LỆNH SẢN XUẤT (WO) & TỰ ĐỘNG SINH JOB TICKETS THEO LƯU TRÌNH
app.post('/api/work-orders', async (req, res) => {
  const { wo_id, product_id, plan_quantity, planned_start_date, planned_due_date } = req.body;
  
  try {
    await db.query('BEGIN');

    // Tạo Work Order
    const woQuery = `
      INSERT INTO mes_work_orders (wo_id, product_id, plan_quantity, planned_start_date, planned_due_date, status)
      VALUES ($1, $2, $3, $4, $5, 'RELEASED')
      RETURNING *;
    `;
    await db.query(woQuery, [wo_id, product_id, plan_quantity, planned_start_date, planned_due_date]);

    // Lấy lưu trình Routing của sản phẩm
    const routingQuery = `
      SELECT r.step_order, r.operation_id, r.standard_time_minutes
      FROM md_routings r
      WHERE r.product_id = $1
      ORDER BY r.step_order ASC;
    `;
    const { rows: steps } = await db.query(routingQuery, [product_id]);

    // Tự động sinh Job Tickets
    for (const step of steps) {
      const ticketId = `${wo_id}-STEP${step.step_order}`;
      const ticketQuery = `
        INSERT INTO mes_job_tickets (ticket_id, wo_id, operation_id, step_order, target_qty, status)
        VALUES ($1, $2, $3, $4, $5, 'PENDING');
      `;
      await db.query(ticketQuery, [ticketId, wo_id, step.operation_id, step.step_order, plan_quantity]);
    }

    await db.query('COMMIT');
    res.json({ success: true, message: `Đã phát lệnh ${wo_id} và tạo thành công ${steps.length} thẻ công đoạn QR!` });
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. API LẤY DANH SÁCH WORK ORDERS & TICKETS
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

// 6. API QUÉT THẺ & THỰC THI SẢN XUẤT (SHOPFLOOR)
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
    const logQuery = `
      INSERT INTO mes_production_logs (ticket_id, machine_id, operator_code, start_time)
      VALUES ($1, $2, $3, NOW())
      RETURNING log_id;
    `;
    const { rows } = await db.query(logQuery, [ticket_id, machine_id, operator_code]);
    
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
    await db.query(`
      UPDATE mes_production_logs
      SET end_time = NOW(), produced_good_qty = $1, produced_scrap_qty = $2
      WHERE log_id = $3
    `, [good_qty, scrap_qty, log_id]);

    if (scrap_qty > 0 && defect_id) {
      await db.query(`
        INSERT INTO mes_defect_logs (log_id, defect_id, defect_qty)
        VALUES ($1, $2, $3)
      `, [log_id, defect_id, scrap_qty]);
    }

    const { rows: machineRow } = await db.query(`SELECT machine_id FROM mes_production_logs WHERE log_id = $1`, [log_id]);
    if (machineRow.length > 0) {
      await db.query(`UPDATE md_machines SET current_status = 'IDLE' WHERE machine_id = $1`, [machineRow[0].machine_id]);
    }

    await db.query(`
      UPDATE mes_job_tickets
      SET good_qty = COALESCE(good_qty, 0) + $1,
          scrap_qty = COALESCE(scrap_qty, 0) + $2,
          status = 'COMPLETED'
      WHERE ticket_id = $3
    `, [good_qty, scrap_qty, ticket_id]);

    await db.query('COMMIT');
    res.json({ success: true, message: 'Hoàn thành ghi nhận sản lượng!' });
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. API DASHBOARD
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
app.listen(PORT, () => {
  console.log(`MES Server running on port ${PORT}`);
});