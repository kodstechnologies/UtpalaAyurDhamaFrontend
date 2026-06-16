/**
 * Resolve how many units should be dispensed for a prescription.
 * Doctors often store the count in `dosage` (e.g. "10") while `quantity` stays at 1.
 * When dosage includes a unit (e.g. "500 ml"), `quantity` is the bottle/pack count.
 */
export const parsePrescriptionNumeric = (value) => {
    if (value === null || value === undefined || value === "") return 0;
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    const match = String(value).match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
};

export const getPrescribedQuantity = (presc) => {
    const qtyField = Number(presc?.quantity || 0);
    const dosageStr = String(presc?.dosage || "").trim();
    const dosageQty = parsePrescriptionNumeric(dosageStr);
    const hasUnitSuffix = /(ml|mg|g|gm|kg|mcg|iu|tablet|tabs?|capsule|caps?)\b/i.test(dosageStr);

    if (hasUnitSuffix) {
        return qtyField > 0 ? qtyField : (dosageQty || 1);
    }

    if (dosageQty > 0) {
        return dosageQty;
    }

    return qtyField > 0 ? qtyField : 1;
};

export const getRemainingPrescriptionQuantity = (presc) => {
    const prescribed = getPrescribedQuantity(presc);
    const dispensed = Number(presc?.dispensedQuantity || 0);
    return Math.max(0, prescribed - dispensed);
};

export const isPrescriptionFullyDispensed = (presc) => {
    return getRemainingPrescriptionQuantity(presc) <= 0;
};
