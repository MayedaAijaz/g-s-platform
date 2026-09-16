// ─────────────────────────────────────────────────────────────────────────────
// GS Medcure — Seed Script
// ⚠️  ALL DATA IS SYNTHETIC / DEMO ONLY.
// Not based on any real G&S Medcure internal records, policies, or systems.
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding SYNTHETIC demo data…");

  // ─── Users ───────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash("Admin@1234!", 12);
  const userHash = await bcrypt.hash("User@1234!", 12);

  const admin = await db.user.upsert({
    where: { email: "admin@gsmedcure.demo" },
    update: {},
    create: {
      email: "admin@gsmedcure.demo",
      name: "System Admin",
      passwordHash: adminHash,
      role: "ADMIN",
      employeeId: "EMP-001",
    },
  });

  const prodManager = await db.user.upsert({
    where: { email: "prod.manager@gsmedcure.demo" },
    update: {},
    create: {
      email: "prod.manager@gsmedcure.demo",
      name: "Ali Hassan",
      passwordHash: userHash,
      role: "PRODUCTION_MANAGER",
      employeeId: "EMP-002",
    },
  });

  const prodOp1 = await db.user.upsert({
    where: { email: "operator1@gsmedcure.demo" },
    update: {},
    create: {
      email: "operator1@gsmedcure.demo",
      name: "Fatima Khan",
      passwordHash: userHash,
      role: "PRODUCTION_OPERATOR",
      employeeId: "EMP-003",
    },
  });

  const qcManager = await db.user.upsert({
    where: { email: "qc.manager@gsmedcure.demo" },
    update: {},
    create: {
      email: "qc.manager@gsmedcure.demo",
      name: "Dr. Zara Iqbal",
      passwordHash: userHash,
      role: "QC_MANAGER",
      employeeId: "EMP-004",
    },
  });

  const qcInspector = await db.user.upsert({
    where: { email: "qc.inspector@gsmedcure.demo" },
    update: {},
    create: {
      email: "qc.inspector@gsmedcure.demo",
      name: "Usman Malik",
      passwordHash: userHash,
      role: "QC_INSPECTOR",
      employeeId: "EMP-005",
    },
  });

  const warehouseManager = await db.user.upsert({
    where: { email: "warehouse@gsmedcure.demo" },
    update: {},
    create: {
      email: "warehouse@gsmedcure.demo",
      name: "Sana Butt",
      passwordHash: userHash,
      role: "WAREHOUSE_MANAGER",
      employeeId: "EMP-006",
    },
  });

  const procOfficer = await db.user.upsert({
    where: { email: "procurement@gsmedcure.demo" },
    update: {},
    create: {
      email: "procurement@gsmedcure.demo",
      name: "Bilal Ahmed",
      passwordHash: userHash,
      role: "PROCUREMENT_OFFICER",
      employeeId: "EMP-007",
    },
  });

  const sterilOp = await db.user.upsert({
    where: { email: "sterilization@gsmedcure.demo" },
    update: {},
    create: {
      email: "sterilization@gsmedcure.demo",
      name: "Nadia Raza",
      passwordHash: userHash,
      role: "STERILIZATION_OPERATOR",
      employeeId: "EMP-008",
    },
  });

  console.log("  ✓ Users");

  // ─── Products (NEOPRO — as per public DRAP listing) ──────────────────────
  const product = await db.product.upsert({
    where: { code: "NEOPRO-DS" },
    update: {},
    create: {
      code: "NEOPRO-DS",
      name: "NEOPRO Disposable Syringe",
      description: "Single-use disposable syringe — SYNTHETIC DEMO DATA",
      productFamily: "Disposable Syringes",
      regulatoryClass: "Class IIa (Demo)",
      draRegistrationNo: "DRAP-DEMO-0001",
    },
  });

  const variant1ml = await db.productVariant.upsert({
    where: { sku: "NEOPRO-DS-1ML-25G" },
    update: {},
    create: {
      productId: product.id,
      sku: "NEOPRO-DS-1ML-25G",
      name: "1 mL, 25G × ⅝\"",
      size: "1 mL",
      needleGauge: "25G",
      barrelCapacityMl: 1,
      packagingConfig: "Blister",
      unitsPerBox: 100,
      boxesPerCarton: 20,
    },
  });

  const variant3ml = await db.productVariant.upsert({
    where: { sku: "NEOPRO-DS-3ML-23G" },
    update: {},
    create: {
      productId: product.id,
      sku: "NEOPRO-DS-3ML-23G",
      name: "3 mL, 23G × 1\"",
      size: "3 mL",
      needleGauge: "23G",
      barrelCapacityMl: 3,
      packagingConfig: "Blister",
      unitsPerBox: 100,
      boxesPerCarton: 20,
    },
  });

  const productAD = await db.product.upsert({
    where: { code: "NEOPRO-AD" },
    update: {},
    create: {
      code: "NEOPRO-AD",
      name: "NEOPRO Auto-Disable Syringe",
      description: "Auto-disable syringe for immunisation — SYNTHETIC DEMO DATA",
      productFamily: "Auto-Disable Syringes",
      regulatoryClass: "Class IIb (Demo)",
      draRegistrationNo: "DRAP-DEMO-0002",
    },
  });

  const variantAD = await db.productVariant.upsert({
    where: { sku: "NEOPRO-AD-05ML-25G" },
    update: {},
    create: {
      productId: productAD.id,
      sku: "NEOPRO-AD-05ML-25G",
      name: "0.5 mL Auto-Disable, 25G",
      size: "0.5 mL",
      needleGauge: "25G",
      barrelCapacityMl: 0.5,
      packagingConfig: "Individual wrap",
      unitsPerBox: 100,
      boxesPerCarton: 50,
    },
  });

  console.log("  ✓ Products & variants");

  // ─── Suppliers (SYNTHETIC) ────────────────────────────────────────────────
  const supplierA = await db.supplier.upsert({
    where: { code: "SUP-POLYPRO-01" },
    update: {},
    create: {
      code: "SUP-POLYPRO-01",
      name: "PolyPro Materials (Demo)",
      country: "Germany",
      contactName: "Demo Contact",
      contactEmail: "contact@polypro.demo",
      isApproved: true,
      notes: "SYNTHETIC demo supplier",
    },
  });

  const supplierB = await db.supplier.upsert({
    where: { code: "SUP-NEEDLE-02" },
    update: {},
    create: {
      code: "SUP-NEEDLE-02",
      name: "Needle Precision Co. (Demo)",
      country: "Japan",
      contactName: "Demo Contact",
      contactEmail: "contact@needleprec.demo",
      isApproved: true,
      notes: "SYNTHETIC demo supplier",
    },
  });

  console.log("  ✓ Suppliers");

  // ─── Materials ────────────────────────────────────────────────────────────
  const matPolypropylene = await db.material.upsert({
    where: { code: "MAT-PP-BARREL" },
    update: {},
    create: {
      code: "MAT-PP-BARREL",
      name: "Polypropylene Resin — Barrel Grade",
      materialType: "Raw Material",
      unitOfMeasure: "kg",
      reorderPoint: 500,
      standardCost: 2.5,
    },
  });

  const matNeedle = await db.material.upsert({
    where: { code: "MAT-SS-NEEDLE" },
    update: {},
    create: {
      code: "MAT-SS-NEEDLE",
      name: "Stainless Steel Needle Cannula",
      materialType: "Component",
      unitOfMeasure: "pcs",
      reorderPoint: 10000,
      standardCost: 0.05,
    },
  });

  const matBlister = await db.material.upsert({
    where: { code: "MAT-BLISTER-PK" },
    update: {},
    create: {
      code: "MAT-BLISTER-PK",
      name: "Blister Packaging Film",
      materialType: "Packaging",
      unitOfMeasure: "m",
      reorderPoint: 2000,
      standardCost: 0.1,
    },
  });

  const matEO = await db.material.upsert({
    where: { code: "MAT-EO-GAS" },
    update: {},
    create: {
      code: "MAT-EO-GAS",
      name: "Ethylene Oxide Gas (Sterilisation)",
      materialType: "Process Material",
      unitOfMeasure: "kg",
      reorderPoint: 50,
      standardCost: 8.0,
    },
  });

  console.log("  ✓ Materials");

  // ─── Warehouse ────────────────────────────────────────────────────────────
  const warehouse = await db.warehouse.upsert({
    where: { code: "WH-RASHAKAI-01" },
    update: {},
    create: {
      code: "WH-RASHAKAI-01",
      name: "Rashakai SEZ Main Store (Demo)",
      address: "Rashakai SEZ, KPK — DEMO",
    },
  });

  const locRaw = await db.warehouseLocation.upsert({
    where: { code: "WH-A1-RAW" },
    update: {},
    create: {
      warehouseId: warehouse.id,
      code: "WH-A1-RAW",
      name: "Raw Materials Zone A1",
      zone: "A",
      aisle: "1",
      rack: "RAW",
    },
  });

  const locFG = await db.warehouseLocation.upsert({
    where: { code: "WH-B1-FG" },
    update: {},
    create: {
      warehouseId: warehouse.id,
      code: "WH-B1-FG",
      name: "Finished Goods Zone B1",
      zone: "B",
      aisle: "1",
      rack: "FG",
    },
  });

  const locQC = await db.warehouseLocation.upsert({
    where: { code: "WH-C1-QC" },
    update: {},
    create: {
      warehouseId: warehouse.id,
      code: "WH-C1-QC",
      name: "QC Hold Zone C1",
      zone: "C",
      aisle: "1",
      rack: "HOLD",
    },
  });

  console.log("  ✓ Warehouse & locations");

  // ─── Purchase Orders ──────────────────────────────────────────────────────
  const po1 = await db.purchaseOrder.upsert({
    where: { poNumber: "PO-2024-0001" },
    update: {},
    create: {
      supplierId: supplierA.id,
      poNumber: "PO-2024-0001",
      status: "RECEIVED",
      orderDate: new Date("2024-01-15"),
    },
  });

  const poItem1 = await db.purchaseOrderItem.findFirst({
    where: { purchaseOrderId: po1.id },
  });

  let poItemId1: string;
  if (!poItem1) {
    const created = await db.purchaseOrderItem.create({
      data: {
        purchaseOrderId: po1.id,
        materialId: matPolypropylene.id,
        quantity: 2000,
        unitPrice: 2.5,
        currency: "USD",
        receivedQuantity: 2000,
      },
    });
    poItemId1 = created.id;
  } else {
    poItemId1 = poItem1.id;
  }

  // ─── Material Lots ────────────────────────────────────────────────────────
  const lot1 = await db.materialLot.upsert({
    where: { lotNumber: "LOT-PP-2024-001" },
    update: {},
    create: {
      materialId: matPolypropylene.id,
      lotNumber: "LOT-PP-2024-001",
      supplierId: supplierA.id,
      supplierLotNumber: "SUP-L-9871",
      manufacturingDate: new Date("2024-01-10"),
      expiryDate: new Date("2027-01-10"),
      initialQuantity: 2000,
      remainingQuantity: 1750,
      locationId: locRaw.id,
    },
  });

  const lot2 = await db.materialLot.upsert({
    where: { lotNumber: "LOT-NEEDLE-2024-001" },
    update: {},
    create: {
      materialId: matNeedle.id,
      lotNumber: "LOT-NEEDLE-2024-001",
      supplierId: supplierB.id,
      supplierLotNumber: "NP-2024-X552",
      manufacturingDate: new Date("2024-01-20"),
      expiryDate: new Date("2030-01-20"),
      initialQuantity: 100000,
      remainingQuantity: 85000,
      locationId: locRaw.id,
    },
  });

  const lot3 = await db.materialLot.upsert({
    where: { lotNumber: "LOT-BPF-2024-001" },
    update: {},
    create: {
      materialId: matBlister.id,
      lotNumber: "LOT-BPF-2024-001",
      initialQuantity: 5000,
      remainingQuantity: 4200,
      locationId: locRaw.id,
    },
  });

  // Inventory balances
  await db.inventoryBalance.upsert({
    where: { materialId_locationId: { materialId: matPolypropylene.id, locationId: locRaw.id } },
    update: {},
    create: { materialId: matPolypropylene.id, locationId: locRaw.id, quantity: 1750 },
  });

  await db.inventoryBalance.upsert({
    where: { materialId_locationId: { materialId: matNeedle.id, locationId: locRaw.id } },
    update: {},
    create: { materialId: matNeedle.id, locationId: locRaw.id, quantity: 85000 },
  });

  console.log("  ✓ Material lots & inventory");

  // ─── Production Infrastructure ────────────────────────────────────────────
  const line1 = await db.productionLine.upsert({
    where: { code: "LINE-01" },
    update: {},
    create: {
      code: "LINE-01",
      name: "Assembly Line 1 (Demo)",
      description: "Main syringe assembly — DEMO",
    },
  });

  const machine1 = await db.machine.upsert({
    where: { code: "MCH-ASSY-01" },
    update: {},
    create: {
      productionLineId: line1.id,
      code: "MCH-ASSY-01",
      name: "Assembly Unit 01 (Demo)",
      machineType: "Syringe Assembly",
      status: "OPERATIONAL",
    },
  });

  const machine2 = await db.machine.upsert({
    where: { code: "MCH-PACK-01" },
    update: {},
    create: {
      productionLineId: line1.id,
      code: "MCH-PACK-01",
      name: "Packaging Unit 01 (Demo)",
      machineType: "Blister Packaging",
      status: "OPERATIONAL",
    },
  });

  console.log("  ✓ Production infrastructure");

  // ─── QC Template ─────────────────────────────────────────────────────────
  const existingTemplate = await db.qCTemplate.findFirst({
    where: { name: "NEOPRO DS Visual & Dimensional Inspection" },
  });

  let qcTemplate = existingTemplate;
  if (!qcTemplate) {
    qcTemplate = await db.qCTemplate.create({
      data: {
        name: "NEOPRO DS Visual & Dimensional Inspection",
        productVariantId: variant1ml.id,
        version: "1.0",
        parameters: {
          create: [
            {
              parameterName: "Barrel Clarity",
              parameterCode: "CLARITY",
              expectedValue: "PASS",
              isCritical: true,
              sortOrder: 1,
            },
            {
              parameterName: "Plunger Stopper Fit",
              parameterCode: "STOPPER_FIT",
              expectedValue: "PASS",
              isCritical: true,
              sortOrder: 2,
            },
            {
              parameterName: "Needle Hub Attachment",
              parameterCode: "NEEDLE_HUB",
              expectedValue: "PASS",
              isCritical: true,
              sortOrder: 3,
            },
            {
              parameterName: "Graduation Marking",
              parameterCode: "GRAD_MARK",
              expectedValue: "PASS",
              isCritical: false,
              sortOrder: 4,
            },
            {
              parameterName: "Barrel Capacity (mL)",
              parameterCode: "BARREL_CAP",
              unit: "mL",
              minValue: 0.95,
              maxValue: 1.05,
              isCritical: true,
              sortOrder: 5,
            },
            {
              parameterName: "Needle Gauge",
              parameterCode: "NEEDLE_GAUGE",
              expectedValue: "25G",
              isCritical: true,
              sortOrder: 6,
            },
          ],
        },
      },
    });
  }

  console.log("  ✓ QC template");

  // ─── Production Order ─────────────────────────────────────────────────────
  const prodOrder = await db.productionOrder.upsert({
    where: { orderNumber: "PO-PROD-2024-001" },
    update: {},
    create: {
      productVariantId: variant1ml.id,
      productionLineId: line1.id,
      orderNumber: "PO-PROD-2024-001",
      plannedQuantity: 50000,
      producedQuantity: 10000,
      plannedStartDate: new Date("2024-02-01"),
      plannedEndDate: new Date("2024-02-15"),
      actualStartDate: new Date("2024-02-01"),
    },
  });

  // ─── Production Batch ─────────────────────────────────────────────────────
  const existingBatch = await db.productionBatch.findUnique({
    where: { batchNumber: "BATCH-2024-001" },
  });

  let batch = existingBatch;
  if (!batch) {
    batch = await db.productionBatch.create({
      data: {
        productionOrderId: prodOrder.id,
        batchNumber: "BATCH-2024-001",
        machineId: machine1.id,
        status: "RELEASED",
        plannedQuantity: 10000,
        producedQuantity: 9950,
        rejectedQuantity: 50,
        startTime: new Date("2024-02-01T07:00:00Z"),
        endTime: new Date("2024-02-01T15:30:00Z"),
        releasedAt: new Date("2024-02-02T09:00:00Z"),
        releasedById: qcManager.id,
        operators: {
          create: [
            { userId: prodOp1.id },
          ],
        },
        batchMaterials: {
          create: [
            {
              materialLotId: lot1.id,
              plannedQuantity: 250,
              actualQuantity: 248,
              consumedAt: new Date("2024-02-01T07:30:00Z"),
            },
            {
              materialLotId: lot2.id,
              plannedQuantity: 10000,
              actualQuantity: 9950,
              consumedAt: new Date("2024-02-01T07:30:00Z"),
            },
            {
              materialLotId: lot3.id,
              plannedQuantity: 100,
              actualQuantity: 99.5,
              consumedAt: new Date("2024-02-01T10:00:00Z"),
            },
          ],
        },
        productionLogs: {
          create: [
            {
              logTime: new Date("2024-02-01T07:00:00Z"),
              eventType: "START",
              description: "Batch production started",
              operatorId: prodOp1.id,
            },
            {
              logTime: new Date("2024-02-01T07:30:00Z"),
              eventType: "MATERIAL_ISSUE",
              description: "Materials issued to line",
              operatorId: prodOp1.id,
            },
            {
              logTime: new Date("2024-02-01T12:00:00Z"),
              eventType: "QUANTITY_UPDATE",
              description: "Mid-run quantity check",
              value: "5000",
              unit: "pcs",
              operatorId: prodOp1.id,
            },
            {
              logTime: new Date("2024-02-01T15:30:00Z"),
              eventType: "END",
              description: "Batch production completed. 50 rejected due to visual defects.",
              operatorId: prodOp1.id,
            },
          ],
        },
      },
    });
  }

  console.log("  ✓ Production batch (BATCH-2024-001)");

  // ─── QC Inspection ────────────────────────────────────────────────────────
  const existingInspection = await db.qCInspection.findFirst({
    where: { batchId: batch.id },
  });

  if (!existingInspection) {
    const params = await db.qCTemplateParameter.findMany({
      where: { templateId: qcTemplate.id },
    });

    await db.qCInspection.create({
      data: {
        batchId: batch.id,
        templateId: qcTemplate.id,
        inspectorId: qcInspector.id,
        sampleSize: 200,
        inspectionDate: new Date("2024-02-01T16:00:00Z"),
        overallStatus: "PASSED",
        notes: "All critical parameters passed. 2 cosmetic defects noted — accepted.",
        results: {
          create: params.map((p) => ({
            parameterId: p.id,
            actualValue:
              p.parameterCode === "BARREL_CAP"
                ? "1.00"
                : p.parameterCode === "NEEDLE_GAUGE"
                ? "25G"
                : "PASS",
            passed: true,
          })),
        },
      },
    });
  }

  console.log("  ✓ QC inspection");

  // ─── Sterilization ────────────────────────────────────────────────────────
  const existingCycle = await db.sterilizationCycle.findUnique({
    where: { cycleNumber: "STC-2024-001" },
  });

  let cycle = existingCycle;
  if (!cycle) {
    cycle = await db.sterilizationCycle.create({
      data: {
        cycleNumber: "STC-2024-001",
        method: "ETHYLENE_OXIDE",
        operatorId: sterilOp.id,
        startTime: new Date("2024-02-02T06:00:00Z"),
        endTime: new Date("2024-02-02T18:00:00Z"),
        temperature: 55,
        pressure: 0.7,
        duration: 720,
        status: "PASSED",
        biIndicatorResult: "PASS",
        chemIndicatorResult: "PASS",
        notes: "EO cycle completed. BI negative. CI confirmed. DEMO DATA.",
      },
    });

    await db.sterilizationBatch.create({
      data: {
        cycleId: cycle.id,
        batchId: batch.id,
        quantityLoaded: 9950,
      },
    });
  }

  console.log("  ✓ Sterilization cycle");

  // ─── Finished Goods ───────────────────────────────────────────────────────
  const existingFG = await db.finishedGood.findUnique({
    where: { lotNumber: "FG-BATCH-2024-001" },
  });

  let fg = existingFG;
  if (!fg) {
    fg = await db.finishedGood.create({
      data: {
        batchId: batch.id,
        locationId: locFG.id,
        lotNumber: "FG-BATCH-2024-001",
        quantity: 9900,
        unitOfMeasure: "units",
      },
    });
  }

  // ─── Dispatch ─────────────────────────────────────────────────────────────
  const existingDispatch = await db.dispatch.findUnique({
    where: { dispatchNumber: "DSP-2024-001" },
  });

  if (!existingDispatch) {
    await db.dispatch.create({
      data: {
        dispatchNumber: "DSP-2024-001",
        customerName: "City Hospital Demo",
        destinationAddress: "Demo Hospital, Peshawar — SYNTHETIC",
        status: "DISPATCHED",
        plannedDispatchDate: new Date("2024-02-05"),
        actualDispatchDate: new Date("2024-02-05"),
        carrier: "Demo Logistics",
        trackingNumber: "TRK-DEMO-001",
        items: {
          create: [{ finishedGoodId: fg.id, quantity: 5000 }],
        },
      },
    });
  }

  console.log("  ✓ Dispatch");

  // ─── Alerts ───────────────────────────────────────────────────────────────
  await db.alert.createMany({
    data: [
      {
        severity: "WARNING",
        entityType: "Material",
        entityId: matPolypropylene.id,
        title: "Low Stock: Polypropylene Resin",
        message: "LOT-PP-2024-001 remaining quantity below reorder point. DEMO.",
        isRead: false,
      },
      {
        severity: "INFO",
        entityType: "ProductionBatch",
        entityId: batch.id,
        title: "Batch BATCH-2024-001 Released",
        message: "Batch released by QC Manager after passing all inspections. DEMO.",
        isRead: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log("  ✓ Alerts");
  console.log("\n✅ Seed complete — SYNTHETIC DEMO DATA only.");
  console.log("\nDemo credentials:");
  console.log("  Admin:       admin@gsmedcure.demo / Admin@1234!");
  console.log("  Others:      <email>@gsmedcure.demo / User@1234!");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
