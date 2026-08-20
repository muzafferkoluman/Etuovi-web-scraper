import React, { useEffect, useState } from "react";
import { Property, PropertySnapshot } from "@koti-scout/shared";
import { formatEuro, formatSqmPrice } from "../../lib/utils";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { MapPin, Heart, Building, ExternalLink } from "lucide-react";
import { DealBadge } from "./DealBadge";
import { ScoreBreakdownWidget } from "./ScoreBreakdownWidget";
import { PriceHistoryChart } from "./PriceHistoryChart";
import { api } from "../../lib/api-client";

export interface PropertyDetailModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (propertyId: string) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property: initialProperty,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite
}) => {
  const [property, setProperty] = useState<Property | null>(initialProperty);
  const [snapshots, setSnapshots] = useState<PropertySnapshot[]>([]);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    setProperty(initialProperty);
    setActivePhotoIdx(0);

    if (initialProperty && isOpen) {
      setIsLoadingDetails(true);

      // Fetch full property details from live API to populate maintenance fee, energy class, full photos etc.
      api.getProperty(initialProperty.id)
        .then((fullProperty) => {
          if (fullProperty) {
            setProperty(fullProperty);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingDetails(false));

      api.getPropertyHistory(initialProperty.id)
        .then((res) => setSnapshots(res.snapshots))
        .catch(() => setSnapshots([]));
    }
  }, [initialProperty, isOpen]);

  if (!property) return null;

  const images = property.imageUrls.length > 0 ? property.imageUrls : [property.thumbnailUrl];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
      <div className="space-y-6">
        {/* Header Title & Location */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{property.district || property.city}, {property.city}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">{property.address}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{property.title}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-black text-slate-950">
                {formatEuro(property.price)}
              </div>
              <div className="text-xs font-semibold text-slate-500">
                {formatSqmPrice(property.pricePerSquareMeter)}
              </div>
            </div>

            <Button
              variant={isFavorite ? "danger" : "outline"}
              size="icon"
              onClick={() => onToggleFavorite(property.id)}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-white" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Photo Gallery & Thumbnail Carousel */}
        <div className="space-y-2">
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-950 shadow-inner">
            <img
              src={images[activePhotoIdx]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            {property.dealIndicator && (
              <div className="absolute top-4 left-4">
                <DealBadge deal={property.dealIndicator} className="bg-white/95 text-slate-900 shadow-lg text-xs" />
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={img + idx}
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                    idx === activePhotoIdx ? "border-emerald-600 ring-2 ring-emerald-200" : "border-transparent opacity-70"
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Intelligence Grid: Score Breakdown & Price History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ScoreBreakdownWidget
            score={property.score ?? 85}
            breakdown={property.scoreBreakdown}
          />
          <PriceHistoryChart
            currentPrice={property.price}
            snapshots={snapshots}
          />
        </div>

        {/* Property Specs Table */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>Property Specifications</span>
            </div>
            {isLoadingDetails && (
              <span className="text-xs font-normal text-emerald-600 animate-pulse">
                Fetching live details from Etuovi...
              </span>
            )}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-xs">
            <div>
              <span className="text-slate-500 block">Property Type</span>
              <span className="font-semibold text-slate-800">{property.propertyType}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Living Area</span>
              <span className="font-semibold text-slate-800">{property.area} m²</span>
            </div>
            <div>
              <span className="text-slate-500 block">Rooms</span>
              <span className="font-semibold text-slate-800">{property.rooms} ({property.bedrooms || 1} bed)</span>
            </div>
            <div>
              <span className="text-slate-500 block">Build Year</span>
              <span className="font-semibold text-slate-800">{property.buildYear || "—"}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Monthly Maintenance</span>
              <span className="font-semibold text-emerald-700">
                {property.maintenanceFee ? `${property.maintenanceFee} € / month` : (isLoadingDetails ? "Loading..." : "See original listing")}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Floor</span>
              <span className="font-semibold text-slate-800">
                {property.floor ? `${property.floor} / ${property.totalFloors || "—"}` : "—"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Energy Class</span>
              <span className="font-semibold text-slate-800">{property.energyClass || "E2018"}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Sauna</span>
              <span className="font-semibold text-slate-800">{property.hasSauna ? "Yes (Oma sauna)" : "No"}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Balcony</span>
              <span className="font-semibold text-slate-800">{property.hasBalcony ? "Yes (Parveke)" : "No"}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Elevator</span>
              <span className="font-semibold text-slate-800">{property.hasElevator ? "Yes (Hissi)" : "No"}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Postal Code</span>
              <span className="font-semibold text-slate-800">{property.postalCode ? `${property.postalCode} ${property.city}` : property.city}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Provider</span>
              <span className="font-semibold text-slate-800">{property.provider}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-100">
          <h4 className="font-bold text-slate-900 mb-1">Description</h4>
          <p>{property.description}</p>
        </div>

        {/* Footer Link & Close */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <a
            href={property.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-semibold hover:underline"
          >
            <span>View original listing source</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <Button variant="secondary" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </div>
    </Modal>
  );
};
