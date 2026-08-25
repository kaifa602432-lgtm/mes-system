const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Phục vụ giao diện Web tĩnh từ thư mục 'public'
app.use(express.static('public'));

// ==========================================================
// 1. MASTER DATA APIS (DANH MỤC GỐC)
// ==========================================================

// Lấy danh sách sản phẩm
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM md_products ORDER BY product_id ASC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Lấy danh sách máy móc
app.get('/api/machines', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM md_machines ORDER BY machine_id ASC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Lấy danh sách lưu trình của sản phẩm
app.get('/api/routings/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const query = `
      SELECT 
        s.step_order,
        o.operation_id,
        o.operation_name,
        s.standard_cycle_time_sec,
        s.setup_time_min,
        s.description
      FROM md_routings r
      JOIN md_routing_steps s ON r.routing_id = s.routing_id
      JOIN md_operations o ON s.operation_id = o.operation_id
      WHERE r.product_id = $1
      ORDER BY s.step_order ASC;
    `;
    const result = await pool.query(query, [productId]);
    res.json({ success: true, product_id: productId, steps: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================================
// 2. WORK ORDER & JOB TICKET APIS (CỐT LÕI MES)
// ==========================================================

// API: Tạo Lệnh sản xuất (Tự động sinh các Job Ticket theo từng bước Routing)
app.post('/api/work-orders', async (req, res) => {
  const client = await pool.connect();
  try {
    const { wo_id, product_id, plan_quantity, planned_start_date, planned_due_date } = req.body;

    if (!wo_id || !product_id || !plan_quantity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu thông tin bắt buộc (wo_id, product_id, plan_quantity)' 
      });
    }

    await client.query('BEGIN'); // Bắt đầu Transaction

    // 1. Tìm Routing ID tương ứng với sản phẩm
    const routingRes = await client.query(
      'SELECT routing_id FROM md_routings WHERE product_id = $1 AND is_active = TRUE LIMIT 1', 
      [product_id]
    );
    if (routingRes.rows.length === 0) {
      throw new Error(`Không tìm thấy Lưu trình sản xuất (Routing) cho sản phẩm ${product_id}`);
    }
    const routing_id = routingRes.rows[0].routing_id;

    // 2. Thêm mới Work Order
    const insertWoQuery = `
      INSERT INTO mes_work_orders (wo_id, product_id, routing_id, plan_quantity, planned_start_date, planned_due_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'RELEASED')
      RETURNING *;
    `;
    const woResult = await client.query(insertWoQuery, [
      wo_id, product_id, routing_id, plan_quantity, planned_start_date, planned_due_date
    ]);

    // 3. Đọc tất cả các bước (steps) trong Routing
    const stepsRes = await client.query(
      'SELECT step_order, operation_id FROM md_routing_steps WHERE routing_id = $1 ORDER BY step_order ASC',
      [routing_id]
    );

    // 4. Tự động sinh Job Ticket (Thẻ công đoạn) cho từng bước
    for (const step of stepsRes.rows) {
      const ticket_id = `${wo_id}-STEP${step.step_order}`;
      const insertTicketQuery = `
        INSERT INTO mes_job_tickets (ticket_id, wo_id, step_order, operation_id, target_qty, status)
        VALUES ($1, $2, $3, $4, $5, 'PENDING');
      `;
      await client.query(insertTicketQuery, [ticket_id, wo_id, step.step_order, step.operation_id, plan_quantity]);
    }

    await client.query('COMMIT'); // Hoàn tất lưu

    res.json({
      success: true,
      message: `Đã tạo lệnh ${wo_id} và tự động sinh ${stepsRes.rows.length} thẻ công đoạn (Job Tickets).`,
      work_order: woResult.rows[0]
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

// API: Lấy danh sách toàn bộ Lệnh sản xuất kèm tiến độ
app.get('/api/work-orders', async (req, res) => {
  try {
    const query = `
      SELECT 
        w.*,
        p.product_name,
        p.unit
      FROM mes_work_orders w
      JOIN md_products p ON w.product_id = p.product_id
      ORDER BY w.created_at DESC;
    `;
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Lấy chi tiết các Thẻ công đoạn (Job Tickets) của 1 Lệnh sản xuất
app.get('/api/work-orders/:woId/tickets', async (req, res) => {
  try {
    const { woId } = req.params;
    const query = `
      SELECT 
        t.*,
        o.operation_name
      FROM mes_job_tickets t
      JOIN md_operations o ON t.operation_id = o.operation_id
      WHERE t.wo_id = $1
      ORDER BY t.step_order ASC;
    `;
    const result = await pool.query(query, [woId]);
    res.json({ success: true, tickets: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================================
// 3. SHOPFLOOR SCAN API (DÀNH CHO QUÉT QR TẠI XƯỞNG)
// ==========================================================

// API: Quét mã QR Thẻ công đoạn
app.get('/api/shopfloor/scan/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const query = `
      SELECT 
        t.ticket_id,
        t.wo_id,
        t.step_order,
        t.target_qty,
        t.good_qty,
        t.scrap_qty,
        t.status AS ticket_status,
        o.operation_name,
        p.product_id,
        p.product_name,
        p.drawing_no,
        p.specification
      FROM mes_job_tickets t
      JOIN mes_work_orders w ON t.wo_id = w.wo_id
      JOIN md_products p ON w.product_id = p.product_id
      JOIN md_operations o ON t.operation_id = o.operation_id
      WHERE t.ticket_id = $1;
    `;
    const result = await pool.query(query, [ticketId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thẻ công đoạn với mã QR này!' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});
// API: Bắt đầu sản xuất tại công đoạn
app.post('/api/shopfloor/start', async (req, res) => {
  const { ticket_id, machine_id, operator_code } = req.body;
  try {
    // Cập nhật trạng thái Thẻ sang RUNNING
    await pool.query(
      `UPDATE mes_job_tickets SET status = 'RUNNING', assigned_machine_id = $1 WHERE ticket_id = $2`,
      [machine_id, ticket_id]
    );
    // Tạo bản ghi log bắt đầu
    const logRes = await pool.query(
      `INSERT INTO mes_production_logs (ticket_id, machine_id, operator_code, start_time) 
       VALUES ($1, $2, $3, NOW()) RETURNING log_id`,
      [ticket_id, machine_id, operator_code]
    );
    res.json({ success: true, log_id: logRes.rows[0].log_id, message: 'Đã bắt đầu gia công!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Hoàn thành sản xuất & Ghi nhận sản lượng OK / NG
app.post('/api/shopfloor/finish', async (req, res) => {
  const { ticket_id, log_id, good_qty, scrap_qty, defect_id } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Cập nhật log thực tế
    await client.query(
      `UPDATE mes_production_logs 
       SET end_time = NOW(), produced_good_qty = $1, produced_scrap_qty = $2 
       WHERE log_id = $3`,
      [good_qty, scrap_qty, log_id]
    );

    // 2. Ghi nhận mã lỗi (nếu có hàng hỏng)
    if (scrap_qty > 0 && defect_id) {
      await client.query(
        `INSERT INTO mes_defect_logs (log_id, defect_id, quantity) VALUES ($1, $2, $3)`,
        [log_id, defect_id, scrap_qty]
      );
    }

    // 3. Cập nhật tích lũy vào Thẻ công đoạn
    await client.query(
      `UPDATE mes_job_tickets 
       SET good_qty = good_qty + $1, scrap_qty = scrap_qty + $2, status = 'COMPLETED' 
       WHERE ticket_id = $3`,
      [good_qty, scrap_qty, ticket_id]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Đã lưu sản lượng thành công!' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});
// API: Lấy danh sách nhật ký sản xuất gần nhất cho Dashboard
app.get('/api/dashboard/logs', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM mes_production_logs ORDER BY log_id DESC LIMIT 10'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// ==========================================================
// KHỞI ĐỘNG SERVER
// ==========================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`MES Server đang chạy tại: http://localhost:${PORT}`);
});