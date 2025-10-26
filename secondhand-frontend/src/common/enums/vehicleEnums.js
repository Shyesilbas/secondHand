import { enumService } from '../services/enumService.js';

export const vehicleEnums = {
  carBrands: [],
  fuelTypes: [],
  colors: [],
  doors: [],
  gearTypes: [],
  seatCounts: [],
};

export const fetchVehicleEnums = async () => {
  try {
    const [
      carBrands,
      fuelTypes,
      colors,
      doors,
      gearTypes,
      seatCounts,
    ] = await Promise.all([
      enumService.getCarBrands(),
      enumService.getFuelTypes(),
      enumService.getColors(),
      enumService.getDoors(),
      enumService.getGearTypes(),
      enumService.getSeatCounts(),
    ]);

    return {
      carBrands,
      fuelTypes,
      colors,
      doors,
      gearTypes,
      seatCounts,
    };
  } catch (error) {
    console.error('Error fetching vehicle enums:', error);
    return vehicleEnums;
  }
};

export const getCarBrandLabel = (value, carBrands) => {
  const brand = carBrands.find(b => b.value === value);
  return brand?.label || value;
};

export const getFuelTypeLabel = (value, fuelTypes) => {
  const fuel = fuelTypes.find(f => f.value === value);
  return fuel?.label || value;
};

export const getColorLabel = (value, colors) => {
  const color = colors.find(c => c.value === value);
  return color?.label || value;
};
