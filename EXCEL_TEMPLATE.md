# Excel Import Templates

## 📊 Projects Template

ไฟล์: `projects-template.xlsx`

| Column | Type | Required | Example | Description |
|--------|------|----------|---------|-------------|
| name | string | ✅ | Solar Rooftop โรงงาน A | ชื่อโปรเจกต์ |
| team | string | ✅ | Engineering | ทีมที่รับผิดชอบ |
| status | string | ✅ | In Progress | In Progress, Planning, Completed, Todo |
| deadline | date | ✅ | 2026-12-31 | วันที่ครบกำหนด (YYYY-MM-DD) |
| progress | number | ✅ | 65 | ความคืบหน้า (0-100) |
| budget | number | ✅ | 12500000 | งบประมาณ |
| revenue | number | ✅ | 16500000 | รายได้ |

### ตัวอย่างข้อมูล:

```
name,team,status,deadline,progress,budget,revenue
ติดตั้ง Solar Rooftop โรงงาน A,Engineering,In Progress,2026-06-30,65,12500000,16500000
สถานีชาร์จ EV Grand Plaza,Installation,Planning,2026-08-15,15,850000,1200000
ซ่อมบำรุง Solar Farm,Maintenance,Completed,2026-02-01,100,150000,350000
```

---

## ✅ Tasks Template

ไฟล์: `tasks-template.xlsx`

| Column | Type | Required | Example | Description |
|--------|------|----------|---------|-------------|
| title | string | ✅ | ตรวจสอบระบบ inverter | ชื่องาน |
| projectId | string | ✅ | p1 | ID ของโปรเจกต์ |
| assignee | string | ✅ | Wichai | ผู้รับผิดชอบ |
| status | string | ✅ | In Progress | Done, In Progress, Todo, Planning |
| priority | string | ✅ | High | High, Medium, Low, Critical |

### ตัวอย่างข้อมูล:

```
title,projectId,assignee,status,priority
ตรวจสอบระบบ inverter,p1,Wichai,In Progress,High
เตรียมเอกสารสัญญา,p2,Somsri,Todo,Medium
ทดสอบระบบชาร์จ,p1,Ken,Done,Low
```

---

## 📝 หมายเหตุ

1. **ไฟล์ต้องเป็น .xlsx หรือ .xls** เท่านั้น
2. **Row แรกเป็นชื่อ column** (header)
3. **Date format**: แนะนำใช้ YYYY-MM-DD
4. **Status values** ต้องตรงกับที่ระบุเท่านั้น
5. **ตัวเลข** ไม่ต้องใส่ comma separator

## 🔄 Import Modes

| Mode | คำอธิบาย |
|------|----------|
| **Upsert** (แนะนำ) | สร้างใหม่ถ้าไม่มี, อัปเดตถ้ามีแล้ว |
| **Create Only** | สร้างใหม่เท่านั้น ข้ามถ้ามีแล้ว |
| **Update Only** | อัปเดตเท่านั้น ข้ามถ้าไม่มี |

---

**สร้างเมื่อ**: 2026-02-28
