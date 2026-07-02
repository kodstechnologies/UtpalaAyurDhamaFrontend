export const getFoodChargeDisplay = (item) => {
  if (item?.description?.trim()) {
    return {
      name: item.name || "Food Charge",
      description: item.description.trim(),
    };
  }

  const parts = String(item?.name || "")
    .split(" - ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 3) {
    return {
      name: parts.slice(0, -1).join(" - "),
      description: parts[parts.length - 1],
    };
  }

  return {
    name: item?.name || "Food Charge",
    description: "",
  };
};
