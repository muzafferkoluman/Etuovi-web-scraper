import { PropertyProvider } from "./types";
import { Property, PropertyFilters, PropertySearchResult, PropertyType } from "@koti-scout/shared";

interface EtuoviAnnouncement {
  id: number;
  friendlyId: string;
  propertyType?: string;
  propertySubtype?: string;
  addressLine1?: string;
  addressLine2?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  constructionFinishedYear?: number;
  publishedOrUpdatedAt?: string;
  publishingTime?: string;
  mainImageUri?: string;
  newBuilding?: boolean;
  roomStructure?: string;
  roomCount?: string;
  floorLevel?: number;
  housingCompanyFloorCount?: number;
  area?: number;
  totalArea?: number;
  searchPrice?: number;
  sellingPrice?: number;
  debfFreePrice?: number;
}

interface EtuoviInitialState {
  announcementListV3?: {
    searchResults?: {
      countOfAllResults?: number;
      announcements?: EtuoviAnnouncement[];
    };
  };
  item?: {
    data?: any;
  };
}

export class EtuoviLivePropertyProvider implements PropertyProvider {
  public readonly name = "EtuoviLivePropertyProvider";
  private baseUrl = "https://www.etuovi.com";
  private userAgent =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36";

  public async search(filters: PropertyFilters): Promise<PropertySearchResult> {
    try {
      const searchUrl = this.buildSearchUrl(filters);
      const html = await this.fetchHtml(searchUrl);
      const state = this.extractInitialState(html);

      const searchResults = state?.announcementListV3?.searchResults;
      const announcements = searchResults?.announcements || [];
      const totalResults = searchResults?.countOfAllResults || announcements.length;

      let properties = announcements.map((ann) => this.mapAnnouncementToProperty(ann));
      properties = this.applyLocalFilters(properties, filters);

      const page = Math.floor((filters.offset || 0) / (filters.limit || 20)) + 1;
      const pageSize = filters.limit || 20;

      return {
        properties,
        total: totalResults,
        page,
        pageSize,
        hasMore: (filters.offset || 0) + properties.length < totalResults,
        provider: this.name
      };
    } catch (error) {
      console.error("[EtuoviLivePropertyProvider] Search error:", error);
      return {
        properties: [],
        total: 0,
        page: 1,
        pageSize: filters.limit || 20,
        hasMore: false,
        provider: this.name
      };
    }
  }

  public async getProperty(externalId: string): Promise<Property | null> {
    try {
      const cleanId = externalId.replace(/^etuovi-/, "");
      const detailUrl = `${this.baseUrl}/kohde/${cleanId}`;
      const html = await this.fetchHtml(detailUrl);
      const state = this.extractInitialState(html);

      const itemData = state?.item?.data;
      if (!itemData) {
        return null;
      }

      return this.mapItemDataToProperty(cleanId, itemData);
    } catch (error) {
      console.error(`[EtuoviLivePropertyProvider] Error fetching property ${externalId}:`, error);
      return null;
    }
  }

  private buildSearchUrl(filters: PropertyFilters): string {
    let path = "/myytavat-asunnot";

    // Single city slug
    if (filters.cities && filters.cities.length === 1) {
      const citySlug = this.slugify(filters.cities[0]);
      path += `/${citySlug}`;

      // Single district slug under single city
      if (filters.districts && filters.districts.length === 1) {
        const districtSlug = this.slugify(filters.districts[0]);
        path += `/${districtSlug}`;
      }
    }

    const queryParams = new URLSearchParams();

    if (filters.minPrice !== undefined) {
      queryParams.set("hintamin", filters.minPrice.toString());
    }
    if (filters.maxPrice !== undefined) {
      queryParams.set("hintamax", filters.maxPrice.toString());
    }
    if (filters.minArea !== undefined) {
      queryParams.set("pinta-alamin", filters.minArea.toString());
    }
    if (filters.maxArea !== undefined) {
      queryParams.set("pinta-alamax", filters.maxArea.toString());
    }
    if (filters.minBuildYear !== undefined) {
      queryParams.set("vuosimyyntimin", filters.minBuildYear.toString());
    }
    if (filters.maxBuildYear !== undefined) {
      queryParams.set("vuosimyyntimax", filters.maxBuildYear.toString());
    }

    const page = Math.floor((filters.offset || 0) / (filters.limit || 20)) + 1;
    if (page > 1) {
      queryParams.set("sivu", page.toString());
    }

    const queryString = queryParams.toString();
    return queryString ? `${this.baseUrl}${path}?${queryString}` : `${this.baseUrl}${path}`;
  }

  private async fetchHtml(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        "User-Agent": this.userAgent,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fi-FI,fi;q=0.9,en-US;q=0.8,en;q=0.7"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }

    return response.text();
  }

  public extractInitialState(html: string): EtuoviInitialState | null {
    const marker = "window.__INITIAL_STATE__ = ";
    const idx = html.indexOf(marker);
    if (idx === -1) return null;

    const sub = html.substring(idx + marker.length);
    const endIdx = sub.indexOf(";\n");
    if (endIdx === -1) return null;

    const jsonStr = sub.substring(0, endIdx);

    try {
      const evalFn = new Function(`return ${jsonStr}`);
      return evalFn() as EtuoviInitialState;
    } catch {
      try {
        const cleaned = jsonStr
          .replace(/:\s*undefined\b/g, ": null")
          .replace(/\[\s*undefined\b/g, "[ null")
          .replace(/,\s*undefined\b/g, ", null");
        return JSON.parse(cleaned) as EtuoviInitialState;
      } catch (err) {
        console.error("[EtuoviLivePropertyProvider] Failed to parse state JSON:", err);
        return null;
      }
    }
  }

  private mapAnnouncementToProperty(ann: EtuoviAnnouncement): Property {
    const externalId = ann.friendlyId || ann.id.toString();
    const id = `etuovi-${externalId}`;
    const price = ann.searchPrice || ann.sellingPrice || ann.debfFreePrice || 0;
    const area = ann.area || ann.totalArea || 0;
    const pricePerSquareMeter = area > 0 ? Math.round(price / area) : 0;

    const locationStr = ann.location || "";
    const { address, city, district } = this.parseLocationString(
      locationStr,
      ann.addressLine1,
      ann.addressLine2
    );

    const propertyType = this.mapPropertyType(ann.propertySubtype || ann.propertyType);
    const rooms = this.parseRoomCount(ann.roomCount, ann.roomStructure);
    const nowIso = new Date().toISOString();
    const publishedIso = ann.publishedOrUpdatedAt || ann.publishingTime || nowIso;

    let thumbnailUrl = "";
    let imageUrls: string[] = [];

    if (ann.mainImageUri) {
      let rawUri = ann.mainImageUri;
      if (rawUri.startsWith("//")) rawUri = `https:${rawUri}`;
      thumbnailUrl = rawUri.replace("{imageParameters}", "500x,q90");
      imageUrls = [rawUri.replace("{imageParameters}", "1200x,q90")];
    } else {
      thumbnailUrl = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80";
      imageUrls = [thumbnailUrl];
    }

    return {
      id,
      externalId,
      provider: this.name,
      sourceUrl: `${this.baseUrl}/kohde/${externalId}`,
      title: `${address}, ${district} ${city}`.replace(/^, /, ""),
      description: ann.roomStructure || `${rooms}h, ${area} m²`,
      address,
      postalCode: "",
      city,
      district,
      latitude: ann.latitude || null,
      longitude: ann.longitude || null,
      price,
      area,
      pricePerSquareMeter,
      rooms,
      bedrooms: null,
      propertyType,
      buildYear: ann.constructionFinishedYear || null,
      maintenanceFee: null,
      floor: ann.floorLevel || null,
      totalFloors: ann.housingCompanyFloorCount || null,
      hasBalcony: (ann.roomStructure || "").toLowerCase().includes("parv"),
      hasSauna: (ann.roomStructure || "").toLowerCase().includes(" s") || (ann.roomStructure || "").toLowerCase().includes(",s,"),
      hasElevator: false,
      energyClass: null,
      thumbnailUrl,
      imageUrls,
      publishedAt: publishedIso,
      firstSeenAt: publishedIso,
      lastSeenAt: nowIso,
      active: true
    };
  }

  private mapItemDataToProperty(externalId: string, item: any): Property {
    const id = `etuovi-${externalId}`;
    const price = item.sellingPrice || item.debfFreePrice || 0;
    const residence = item.residenceDetailsDTO || {};
    const area = residence.livingArea || residence.totalArea || 0;
    const pricePerSquareMeter = item.pricePerSquareMeter || (area > 0 ? Math.round(price / area) : 0);

    const propDetails = item.property || {};
    const housingCo = propDetails.housingCompany || {};
    const loc = propDetails.location || {};

    const address = item.addressLine1 || loc.streetAddress || "Osoite ei ilmoitettu";
    const city = loc.city || "Helsinki";
    const district = loc.district || "";

    const propertyType = this.mapPropertyType(residence.residentialPropertyType || propDetails.propertyType);
    const rooms = residence.totalRoomCount || this.parseRoomCount(residence.roomCount, residence.roomStructure);
    const bedrooms = residence.bedroomCount || null;

    let maintenanceFee: number | null = null;
    if (Array.isArray(item.periodicCharges)) {
      const hoito = item.periodicCharges.find((c: any) => c.periodicCharge === "HOUSING_COMPANY_MAINTENANCE_CHARGE");
      if (hoito) maintenanceFee = hoito.price;
    }

    const nowIso = new Date().toISOString();
    const publishedIso = item.publishingTime || item.creationTime || nowIso;

    const images: string[] = [];
    if (item.imageIds && typeof item.imageIds === "object") {
      Object.values(item.imageIds).forEach((imgObj: any) => {
        if (imgObj?.image?.uri) {
          let uri = imgObj.image.uri;
          if (uri.startsWith("//")) uri = `https:${uri}`;
          images.push(uri.replace("{imageParameters}", "1200x,q90"));
        }
      });
    }

    const thumbnailUrl = images[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80";
    const energyClass = housingCo.energyCertificate?.energyCertificateType || null;

    return {
      id,
      externalId,
      provider: this.name,
      sourceUrl: `${this.baseUrl}/kohde/${externalId}`,
      title: `${address}, ${district} ${city}`.replace(/^, /, ""),
      description: residence.livingRoomDescription || item.text?.propertyDescription || residence.roomStructure || "",
      address,
      postalCode: loc.postalCode || "",
      city,
      district,
      latitude: loc.latitude || null,
      longitude: loc.longitude || null,
      price,
      area,
      pricePerSquareMeter,
      rooms,
      bedrooms,
      propertyType,
      buildYear: residence.constructionFinishedYear || housingCo.buildYear || null,
      maintenanceFee,
      floor: residence.housingCompanyApartmentInformationDTO?.floorLevel || null,
      totalFloors: housingCo.floorCount || null,
      hasBalcony: (residence.generalDwellingFeatures || []).includes("BALCONY") || (residence.roomStructure || "").toLowerCase().includes("parv"),
      hasSauna: (residence.generalDwellingFeatures || []).includes("OWN_SAUNA") || (residence.generalDwellingFeatures || []).includes("HOUSING_COMPANY_HAS_SAUNA"),
      hasElevator: (housingCo.housingCompanyFeatures || []).includes("ELEVATOR"),
      energyClass,
      thumbnailUrl,
      imageUrls: images.length > 0 ? images : [thumbnailUrl],
      publishedAt: publishedIso,
      firstSeenAt: publishedIso,
      lastSeenAt: nowIso,
      active: true
    };
  }

  private parseLocationString(
    locationStr: string,
    addr1?: string,
    addr2?: string
  ): { address: string; city: string; district: string } {
    let address = addr1 || "";
    let city = "";
    let district = "";

    if (addr2) {
      const parts = addr2.trim().split(/\s+/);
      city = parts[parts.length - 1] || "";
      district = parts.slice(0, -1).join(" ") || "";
    }

    if (!address && locationStr) {
      const parts = locationStr.split(" ");
      if (parts.length >= 3) {
        city = parts[parts.length - 1];
        district = parts[parts.length - 2];
        address = parts.slice(0, -2).join(" ");
      } else {
        address = locationStr;
      }
    }

    return {
      address: address || "Tuntematon osoite",
      city: city || "Helsinki",
      district: district || ""
    };
  }

  private mapPropertyType(subtype?: string): PropertyType {
    if (!subtype) return "Apartment";
    const upper = subtype.toUpperCase();
    if (upper.includes("APARTMENT") || upper.includes("KERROSTALO")) return "Apartment";
    if (upper.includes("ROW") || upper.includes("RIVITALO")) return "Row house";
    if (upper.includes("SEPARATE") || upper.includes("OMAKOTITALO") || upper.includes("DETACHED")) return "Detached house";
    if (upper.includes("SEMI") || upper.includes("PARITALO") || upper.includes("TWIN")) return "Semi-detached";
    return "Apartment";
  }

  private parseRoomCount(countEnum?: string, structureStr?: string): number {
    if (countEnum) {
      if (countEnum === "ONE_ROOM") return 1;
      if (countEnum === "TWO_ROOMS") return 2;
      if (countEnum === "THREE_ROOMS") return 3;
      if (countEnum === "FOUR_ROOMS") return 4;
      if (countEnum === "FIVE_ROOMS") return 5;
    }

    if (structureStr) {
      const match = structureStr.match(/^(\d+)\s*h\b/i) || structureStr.match(/^(\d+)\s*mh\b/i);
      if (match) {
        return parseInt(match[1], 10);
      }
    }

    return 2;
  }

  private applyLocalFilters(properties: Property[], filters: PropertyFilters): Property[] {
    return properties.filter((p) => {
      if (filters.minPrice !== undefined && p.price < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && p.price > filters.maxPrice) return false;
      if (filters.minArea !== undefined && p.area < filters.minArea) return false;
      if (filters.maxArea !== undefined && p.area > filters.maxArea) return false;
      if (filters.minRooms !== undefined && p.rooms < filters.minRooms) return false;
      if (filters.maxRooms !== undefined && p.rooms > filters.maxRooms) return false;
      if (filters.maxMaintenanceFee !== undefined && p.maintenanceFee !== null && p.maintenanceFee > filters.maxMaintenanceFee) return false;

      if (filters.balconyRequired && !p.hasBalcony) return false;
      if (filters.saunaRequired && !p.hasSauna) return false;

      if (filters.cities && filters.cities.length > 0) {
        const cityMatch = filters.cities.some(
          (c) => p.city.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(p.city.toLowerCase())
        );
        if (!cityMatch) return false;
      }

      if (filters.districts && filters.districts.length > 0) {
        const districtMatch = filters.districts.some(
          (d) =>
            p.district.toLowerCase().includes(d.toLowerCase()) ||
            p.title.toLowerCase().includes(d.toLowerCase()) ||
            p.address.toLowerCase().includes(d.toLowerCase()) ||
            d.toLowerCase().includes(p.district.toLowerCase())
        );
        if (!districtMatch) return false;
      }

      return true;
    });
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/ä/g, "a")
      .replace(/ö/g, "o")
      .replace(/å/g, "a")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
}
