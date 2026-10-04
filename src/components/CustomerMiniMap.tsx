import React, { useState } from 'react';
import { MapPin, Navigation, ExternalLink, Edit3, Compass, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';
import { customerApi } from '../lib/api';

interface CustomerMiniMapProps {
  customerId: string;
  customerName?: string;
  company?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  mapUrl?: string | null;
  canEdit?: boolean;
  onLocationUpdated?: () => void;
  className?: string;
}

export const CustomerMiniMap: React.FC<CustomerMiniMapProps> = ({
  customerId,
  customerName,
  company,
  address,
  city,
  state,
  pincode,
  latitude,
  longitude,
  mapUrl,
  canEdit = true,
  onLocationUpdated,
  className = '',
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    address: address || '',
    city: city || '',
    state: state || '',
    pincode: pincode || '',
    latitude: latitude !== null && latitude !== undefined ? String(latitude) : '',
    longitude: longitude !== null && longitude !== undefined ? String(longitude) : '',
    map_url: mapUrl || '',
  });

  const hasCoordinates =
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

  const hasMapUrl = Boolean(mapUrl && mapUrl.trim().length > 0);
  const hasAddress = Boolean(address || city || state || pincode);

  // Build target Google Maps link
  const googleMapsUrl = hasMapUrl
    ? mapUrl!
    : hasCoordinates
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : null;

  // Build target directions link
  const directionsUrl = hasCoordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    : hasMapUrl
    ? mapUrl!
    : null;

  // Formatted address line
  const locationLines = [
    address,
    [city, state].filter(Boolean).join(', '),
    pincode ? `PIN - ${pincode}` : null,
  ].filter(Boolean);

  const handleOpenEdit = () => {
    setEditForm({
      address: address || '',
      city: city || '',
      state: state || '',
      pincode: pincode || '',
      latitude: latitude !== null && latitude !== undefined ? String(latitude) : '',
      longitude: longitude !== null && longitude !== undefined ? String(longitude) : '',
      map_url: mapUrl || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const latVal = editForm.latitude ? parseFloat(editForm.latitude) : null;
      const lngVal = editForm.longitude ? parseFloat(editForm.longitude) : null;

      await customerApi.update(customerId, {
        address: editForm.address || null,
        city: editForm.city || null,
        state: editForm.state || null,
        pincode: editForm.pincode || null,
        latitude: latVal !== null && !isNaN(latVal) ? latVal : null,
        longitude: lngVal !== null && !isNaN(lngVal) ? lngVal : null,
        map_url: editForm.map_url || null,
      });

      setIsEditModalOpen(false);
      if (onLocationUpdated) {
        onLocationUpdated();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update customer location.');
    } finally {
      setIsSaving(false);
    }
  };

  // Safe OSM Bounding Box: ~500m area around lat, lng
  const delta = 0.005;
  const osmEmbedUrl = hasCoordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${longitude! - delta}%2C${latitude! - delta * 0.7}%2C${longitude! + delta}%2C${latitude! + delta * 0.7}&layer=mapnik&marker=${latitude}%2C${longitude}`
    : null;

  return (
    <div
      className={`rounded-2xl bg-[#101419] border border-white/10 p-4 flex flex-col justify-between shadow-xl shadow-black/20 ${className}`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#00F2FE]/10 border border-[#00F2FE]/30 flex items-center justify-center text-[#00F2FE]">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-white">
              Customer Location
            </h3>
            <span className="text-[10px] font-mono text-[#9BA3AE]">Primary Company Address</span>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenEdit}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#9BA3AE] hover:text-[#00F2FE] transition-colors cursor-pointer"
            title="Edit Customer Location"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Mini Map View Area */}
      <div className="my-3">
        {hasCoordinates && osmEmbedUrl ? (
          <div className="relative w-full h-[180px] sm:h-[200px] rounded-xl overflow-hidden border border-white/10 bg-[#07090C] group">
            {/* Dark Styled OSM Iframe */}
            <iframe
              title={`Location map for ${customerName || 'customer'}`}
              src={osmEmbedUrl}
              className="w-full h-full border-0 pointer-events-auto"
              style={{
                filter: 'invert(90%) hue-rotate(180deg) brightness(85%) contrast(115%)',
              }}
              loading="lazy"
            />
            {/* Interactive Overlay Badge */}
            <div className="absolute top-2 left-2 pointer-events-none bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-[#00F2FE] animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-white">
                {latitude!.toFixed(5)}, {longitude!.toFixed(5)}
              </span>
            </div>
            <div className="absolute bottom-2 right-2 pointer-events-none bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 text-[9px] font-mono text-[#9BA3AE]">
              © OpenStreetMap
            </div>
          </div>
        ) : hasMapUrl ? (
          <div className="w-full h-[140px] rounded-xl border border-white/10 bg-[#07090C] flex flex-col items-center justify-center p-4 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#00F2FE]/10 border border-[#00F2FE]/30 flex items-center justify-center text-[#00F2FE]">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="text-xs font-bold text-white font-mono">📍 Location Available</div>
              <div className="text-[11px] text-[#9BA3AE] mt-0.5 line-clamp-1 max-w-[260px]">
                Verified map link recorded
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-[120px] rounded-xl border border-dashed border-white/10 bg-[#07090C]/50 flex flex-col items-center justify-center p-4 text-center space-y-1.5">
            <MapPin className="w-6 h-6 text-[#9BA3AE]/40" />
            <div className="text-xs font-mono text-[#9BA3AE]">📍 Location Not Available</div>
            <p className="text-[10px] text-[#9BA3AE]/60 max-w-[220px]">
              No coordinates or map link configured.
            </p>
          </div>
        )}
      </div>

      {/* Address & Entity Details */}
      <div className="space-y-1.5 pt-2 border-t border-white/5">
        {(company || customerName) && (
          <div className="text-xs font-bold text-white font-heading truncate">
            {company || customerName}
          </div>
        )}

        {hasAddress ? (
          <div className="text-xs text-[#CBD5E1] space-y-0.5">
            {locationLines.map((line, idx) => (
              <div key={idx} className="line-clamp-1">
                {line}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-[#9BA3AE]/60 italic">No street address saved.</div>
        )}

        {hasCoordinates && (
          <div className="pt-1 flex items-center gap-1.5 text-[10px] font-mono text-[#9BA3AE]">
            <span>Coords:</span>
            <span className="text-[#00F2FE]">{latitude!.toFixed(5)}, {longitude!.toFixed(5)}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10">
        {googleMapsUrl ? (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors flex items-center justify-center gap-1.5 text-xs font-mono text-center font-medium cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span className="truncate">Open in Maps</span>
          </a>
        ) : (
          <button
            disabled
            className="px-2.5 py-2 rounded-xl bg-white/5 text-[#9BA3AE]/40 border border-white/5 flex items-center justify-center gap-1.5 text-xs font-mono text-center cursor-not-allowed"
          >
            <ExternalLink className="w-3.5 h-3.5 opacity-40" />
            <span className="truncate">Open in Maps</span>
          </button>
        )}

        {directionsUrl ? (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-2 rounded-xl bg-[#00F2FE]/10 hover:bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/30 transition-colors flex items-center justify-center gap-1.5 text-xs font-mono text-center font-bold cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="truncate">Directions</span>
          </a>
        ) : (
          <button
            disabled
            className="px-2.5 py-2 rounded-xl bg-white/5 text-[#9BA3AE]/40 border border-white/5 flex items-center justify-center gap-1.5 text-xs font-mono text-center cursor-not-allowed"
          >
            <Navigation className="w-3.5 h-3.5 opacity-40" />
            <span className="truncate">Directions</span>
          </button>
        )}
      </div>

      {/* Edit Location Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Customer Location"
          subtitle={`Customer: ${customerName || customerId}`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveLocation} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-[#9BA3AE] block mb-1">
                Street Address / Premises
              </label>
              <input
                type="text"
                placeholder="e.g. 402 Solitaire Business Hub, Baner Road"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                className="w-full bg-[#07090C] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-mono text-[#9BA3AE] block mb-1">City</label>
                <input
                  type="text"
                  placeholder="Pune"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  className="w-full bg-[#07090C] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-[#9BA3AE] block mb-1">State</label>
                <input
                  type="text"
                  placeholder="Maharashtra"
                  value={editForm.state}
                  onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                  className="w-full bg-[#07090C] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-[#9BA3AE] block mb-1">Pincode</label>
                <input
                  type="text"
                  placeholder="411045"
                  value={editForm.pincode}
                  onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                  className="w-full bg-[#07090C] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-[#9BA3AE] block mb-1">
                Google Maps / Location Link (map_url)
              </label>
              <input
                type="url"
                placeholder="https://maps.google.com/?q=18.5590,73.7868"
                value={editForm.map_url}
                onChange={(e) => setEditForm({ ...editForm, map_url: e.target.value })}
                className="w-full bg-[#07090C] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
              />
              <span className="text-[10px] font-mono text-[#9BA3AE]/70 mt-1 block">
                Coordinates will be safely preserved or auto-extracted if available.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
              <div>
                <label className="text-xs font-mono text-[#9BA3AE] block mb-1">
                  Latitude (-90 to 90)
                </label>
                <input
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  placeholder="18.5590"
                  value={editForm.latitude}
                  onChange={(e) => setEditForm({ ...editForm, latitude: e.target.value })}
                  className="w-full bg-[#07090C] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-[#9BA3AE] block mb-1">
                  Longitude (-180 to 180)
                </label>
                <input
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  placeholder="73.7868"
                  value={editForm.longitude}
                  onChange={(e) => setEditForm({ ...editForm, longitude: e.target.value })}
                  className="w-full bg-[#07090C] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-[#00F2FE] hover:bg-[#00F2FE]/90 text-black font-semibold text-xs transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Location'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
