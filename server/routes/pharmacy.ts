import { RequestHandler } from "express";
import { db } from "../db.js";
import { FALLBACK_MEDICINES } from "../fallback-data.js";

export const handleGetMedicines: RequestHandler = async (req, res) => {
  const { query } = req.query;

  try {
    let medicines: any[] = [];
    try {
      medicines = await db.medicine.findMany();
      if (medicines.length === 0) medicines = FALLBACK_MEDICINES;
    } catch (dbError: any) {
      console.warn("Database offline during medicine fetch, using fallback data:", dbError?.message || dbError);
      medicines = FALLBACK_MEDICINES;
    }

    if (query) {
      const q = String(query).toLowerCase();
      medicines = medicines.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.genericName.toLowerCase().includes(q) ||
          (m.category && m.category.toLowerCase().includes(q))
      );
    }

    res.json(medicines);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const handleGetPharmacies: RequestHandler = async (req, res) => {
  try {
    const stores = await db.pharmacy.findMany();
    res.json(stores);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
