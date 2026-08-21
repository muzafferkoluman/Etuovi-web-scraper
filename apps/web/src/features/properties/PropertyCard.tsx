import { useTranslation } from "../../contexts/LanguageContext";
import React from "react";
import { Property } from "@koti-scout/shared";
import { formatEuro, formatSqmPrice } from "../../lib/utils";
import { Heart, Scale, Sparkles, MapPin } from "lucide-react";
import { DealBadge } from "./DealBadge";

export interface PropertyCardProps {
  property: Property;
  isFavorite?: boolean;
  isCompared?: boolean;
  onToggleFavorite?: (propertyId: string) => void;
  onToggleCompare?: (property: Property) => void;
  onViewDetails?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isFavorite = false,
  isCompared = false,
  onToggleFavorite,
  onToggleCompare,
  onViewDetails
}) => {
  const { t } = useTranslation();
  return (
    <div className="nordic-card rounded-2xl overflow-hidden flex flex-col group bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-lg">
      {/* Thumbnail & Badges */}
      <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden cursor-pointer" onClick={() => onViewDetails?.(property)}>
        <img
          src={property.thumbnailUrl}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />

        {/* Smart Tag Badges overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 max-w-[80%]">
          {property.smartTags?.map((tag) => {
            const isPriceDrop = tag === "PRICE DROP";
            const isGreatMatch = tag === "GREAT MATCH";
            const isNew = tag === "NEW";
            return (
              <span
                key={tag}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold shadow-sm backdrop-blur-md ${
                  isPriceDrop
                    ? "bg-rose-600 text-white"
                    : isGreatMatch
                    ? "bg-amber-500 text-slate-950 font-extrabold"
                    : isNew
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-950/80 text-white"
                }`}
              >
                {tag}
              </span>
            );
          })}
        </div>

        {/* Top Right Actions (Favorite & Compare) */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(property.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all ${
              isFavorite
                ? "bg-rose-950/80 border border-rose-500/40 text-rose-400 shadow-md"
                : "bg-slate-950/70 border border-white/10 text-slate-300 hover:bg-slate-900 hover:text-rose-400"
            }`}
            title={isFavorite ? "Remove from favorites" : "Save to favorites"}
            aria-label="Favorite toggle"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
          </button>
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-2.5 left-2.5">
          <div className="bg-slate-950/90 border border-white/10 backdrop-blur-md px-3 py-1 rounded-lg text-white font-black text-lg shadow-md font-mono">
            {formatEuro(property.price)}
          </div>
        </div>

        {/* Match Score Badge */}
        {property.score !== undefined && (
          <div className="absolute bottom-2.5 right-2.5">
            <div className="bg-emerald-600/95 backdrop-blur-md text-white px-2.5 py-1 rounded-lg flex items-center gap-1 text-xs font-black shadow-md font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{property.score} / 100</span>
            </div>
          </div>
        )}
      </div>

      {/* Property Information Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Location & District */}
          <div className="flex items-center gap-1 text-xs text-slate-400 font-medium mb-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="truncate">
              {property.district}, {property.city}
            </span>
          </div>

          <h3
            className="text-sm font-bold text-white line-clamp-1 hover:text-emerald-400 cursor-pointer transition-colors"
            onClick={() => onViewDetails?.(property)}
          >
            {property.address}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 mt-1 mb-3">
            {property.title}
          </p>

          {/* Key Specs Grid */}
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 py-2.5 my-2 border-y border-slate-800 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Area:</span>
              <span className="font-semibold text-slate-200">{property.area} m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{t("prop.rooms")}:</span>
              <span className="font-semibold text-slate-200">{property.rooms} rooms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Price/m²:</span>
              <span className="font-semibold text-slate-200">{formatSqmPrice(property.pricePerSquareMeter)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{t("prop.built")}:</span>
              <span className="font-semibold text-slate-200">{property.buildYear || "—"}</span>
            </div>
          </div>

          {/* Maintenance fee & Deal indicator */}
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400">{t("prop.maintenance")}:</span>
            <span className="font-semibold text-emerald-400 font-mono">
              {property.maintenanceFee ? `${property.maintenanceFee} €/mo` : "N/A"}
            </span>
          </div>

          {property.dealIndicator && (
            <div className="mb-3">
              <DealBadge deal={property.dealIndicator} />
            </div>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="pt-2 mt-auto border-t border-slate-800 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onToggleCompare?.(property)}
            className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors ${
              isCompared
                ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/40"
                : "text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isCompared ? "Compared" : "Compare"}</span>
          </button>

          <button
            type="button"
            onClick={() => onViewDetails?.(property)}
            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 transition-all ml-auto"
          >
            <span>View property</span>
          </button>
        </div>
      </div>
    </div>
  );
};
