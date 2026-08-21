import React, { useState } from 'react';
import { Favorite, Property } from '@koti-scout/shared';
import { PropertyCard } from '../properties/PropertyCard';
import { PropertyDetailModal } from '../properties/PropertyDetailModal';
import { api } from '../../lib/api-client';
import { Heart, Edit3, Trash2, Check, Scale } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export interface FavoritesPageProps {
  favorites: Favorite[];
  onRefresh: () => void;
  onToggleFavorite: (id: string) => void;
  comparedProperties: Property[];
  onToggleCompare: (prop: Property) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  favorites,
  onRefresh,
  onToggleFavorite,
  comparedProperties,
  onToggleCompare
}) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');

  const startEditNotes = (fav: Favorite) => {
    setEditingId(fav.id);
    setNotesText(fav.notes || '');
  };

  const saveNotes = async (fav: Favorite) => {
    await api.updateFavoriteNotes(fav.propertyId, notesText);
    setEditingId(null);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Saved Favorites & Notes</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Properties you have saved for further inspection. Keep private notes on pipe renovations, maintenance records, and viewing impressions.
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-slate-900/90 p-12 rounded-2xl border border-slate-800 text-center max-w-md mx-auto shadow-sm space-y-3">
          <Heart className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-white">No favorite properties saved</h3>
          <p className="text-xs text-slate-400">
            Click the heart icon on any property card to save it here with custom notes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => {
            if (!fav.property) return null;
            const prop = fav.property;
            const isEditing = editingId === fav.id;

            return (
              <div key={fav.id} className="flex flex-col bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
                <PropertyCard
                  property={prop}
                  isFavorite={true}
                  isCompared={comparedProperties.some((p) => p.id === prop.id)}
                  onToggleFavorite={onToggleFavorite}
                  onToggleCompare={onToggleCompare}
                  onViewDetails={setSelectedProperty}
                />

                {/* Personal Notes Section */}
                <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex-1 flex flex-col justify-between text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-200 flex items-center gap-1">
                        <Edit3 className="w-3 h-3 text-emerald-600" />
                        <span>Personal Notes</span>
                      </span>
                      {!isEditing && (
                        <button
                          onClick={() => startEditNotes(fav)}
                          className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
                        >
                          Edit note
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={notesText}
                          onChange={(e) => setNotesText(e.target.value)}
                          placeholder="Add personal impressions, questions for broker, renovation notes..."
                          className="w-full text-xs p-2.5 bg-slate-900/90 border border-slate-800 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          rows={3}
                        />
                        <div className="flex justify-end gap-1.5">
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                          <Button size="sm" variant="primary" onClick={() => saveNotes(fav)}>
                            <Check className="w-3 h-3 mr-1" />
                            <span>Save</span>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-600 italic bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 min-h-[48px]">
                        {fav.notes || 'No notes yet. Click edit to add notes.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PropertyDetailModal
        property={selectedProperty}
        isOpen={Boolean(selectedProperty)}
        onClose={() => setSelectedProperty(null)}
        isFavorite={true}
        onToggleFavorite={onToggleFavorite}
      />
    </div>
  );
};
