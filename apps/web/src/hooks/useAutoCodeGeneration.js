export function useAutoCodeGeneration() {
  const generateMaterialCode = (existingCount) => {
    const nextNum = existingCount + 1;
    return `MAT-${String(nextNum).padStart(6, '0')}`;
  };

  const generateProductSKU = (existingCount) => {
    const nextNum = existingCount + 1;
    return `SKU-${String(nextNum).padStart(6, '0')}`;
  };

  return {
    generateMaterialCode,
    generateProductSKU
  };
}