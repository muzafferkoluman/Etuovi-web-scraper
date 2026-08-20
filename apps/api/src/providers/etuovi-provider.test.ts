import { describe, it, expect } from "vitest";
import { EtuoviLivePropertyProvider } from "./etuovi-live-provider";

describe("EtuoviLivePropertyProvider", () => {
  const provider = new EtuoviLivePropertyProvider();

  it("should have correct provider name", () => {
    expect(provider.name).toBe("EtuoviLivePropertyProvider");
  });

  it("should extract initial state from Etuovi HTML sample", () => {
    const sampleHtml = `
      <!DOCTYPE html>
      <html>
      <head>
      <script>
        window.__INITIAL_STATE__ = {"announcementListV3":{"searchResults":{"countOfAllResults":100,"announcements":[{"id":12345,"friendlyId":"80524411","searchPrice":250000,"area":65.5,"location":"Testikatu 1 Helsinki","roomStructure":"2h, k","propertySubtype":"APARTMENT_HOUSE"}]}}};
      </script>
      </head>
      </html>
    `;

    const state = provider.extractInitialState(sampleHtml);
    expect(state).toBeDefined();
    expect(state?.announcementListV3?.searchResults?.countOfAllResults).toBe(100);
    expect(state?.announcementListV3?.searchResults?.announcements?.length).toBe(1);
    expect(state?.announcementListV3?.searchResults?.announcements?.[0].searchPrice).toBe(250000);
  });

  it("should fetch live properties from Etuovi.com", async () => {
    const result = await provider.search({
      cities: ["Helsinki"],
      minPrice: 100000,
      maxPrice: 500000,
      limit: 10
    });

    expect(result.provider).toBe("EtuoviLivePropertyProvider");
    expect(result.properties.length).toBeGreaterThan(0);
    const first = result.properties[0];
    expect(first.id).toMatch(/^etuovi-/);
    expect(first.price).toBeGreaterThan(0);
    expect(first.sourceUrl).toContain("https://www.etuovi.com/kohde/");
  }, 15000);
});
