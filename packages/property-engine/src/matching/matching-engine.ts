import { Property, PropertyFilters } from '@koti-scout/shared';

export class PropertyMatchingEngine {
  public matches(property: Property, filters: PropertyFilters): boolean {
    // Keyword search
    if (filters.keyword && filters.keyword.trim().length > 0) {
      const kw = filters.keyword.toLowerCase().trim();
      const matchText = `${property.title} ${property.description} ${property.address} ${property.district} ${property.city}`.toLowerCase();
      if (!matchText.includes(kw)) {
        return false;
      }
    }

    // Cities
    if (filters.cities && filters.cities.length > 0) {
      const matchCity = filters.cities.some(c => c.toLowerCase() === property.city.toLowerCase());
      if (!matchCity) return false;
    }

    // Districts
    if (filters.districts && filters.districts.length > 0) {
      const matchDistrict = filters.districts.some(d => d.toLowerCase() === property.district.toLowerCase());
      if (!matchDistrict) return false;
    }

    // Price limits
    if (filters.minPrice !== undefined && property.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && property.price > filters.maxPrice) return false;

    // Area limits
    if (filters.minArea !== undefined && property.area < filters.minArea) return false;
    if (filters.maxArea !== undefined && property.area > filters.maxArea) return false;

    // Price per sqm
    if (filters.minPricePerSquareMeter !== undefined && property.pricePerSquareMeter < filters.minPricePerSquareMeter) return false;
    if (filters.maxPricePerSquareMeter !== undefined && property.pricePerSquareMeter > filters.maxPricePerSquareMeter) return false;

    // Rooms
    if (filters.minRooms !== undefined && property.rooms < filters.minRooms) return false;
    if (filters.maxRooms !== undefined && property.rooms > filters.maxRooms) return false;

    // Build Year
    if (property.buildYear !== null) {
      if (filters.minBuildYear !== undefined && property.buildYear < filters.minBuildYear) return false;
      if (filters.maxBuildYear !== undefined && property.buildYear > filters.maxBuildYear) return false;
    }

    // Property Types
    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      if (!filters.propertyTypes.includes(property.propertyType)) return false;
    }

    // Maintenance Fee
    if (filters.maxMaintenanceFee !== undefined) {
      if (property.maintenanceFee !== null && property.maintenanceFee > filters.maxMaintenanceFee) {
        return false;
      }
    }

    // Amenities
    if (filters.balconyRequired && !property.hasBalcony) return false;
    if (filters.saunaRequired && !property.hasSauna) return false;
    if (filters.elevatorRequired && !property.hasElevator) return false;

    // New building only
    if (filters.newBuildingOnly) {
      const currentYear = new Date().getFullYear();
      if (!property.buildYear || property.buildYear < currentYear - 3) return false;
    }

    return true;
  }

  public sortProperties(properties: Property[], sortBy?: string): Property[] {
    const list = [...properties];
    switch (sortBy) {
      case 'newest':
        return list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      case 'oldest':
        return list.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
      case 'price-low':
        return list.sort((a, b) => a.price - b.price);
      case 'price-high':
        return list.sort((a, b) => b.price - a.price);
      case 'sqm-price-low':
        return list.sort((a, b) => a.pricePerSquareMeter - b.pricePerSquareMeter);
      case 'sqm-price-high':
        return list.sort((a, b) => b.pricePerSquareMeter - a.pricePerSquareMeter);
      case 'area-high':
        return list.sort((a, b) => b.area - a.area);
      case 'score-high':
        return list.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      default:
        return list.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    }
  }
}
