import React, { useState, useEffect } from 'react';
import { 
  APIProvider, 
  Map, 
  Marker, 
  useMap 
} from '@vis.gl/react-google-maps';
import { X, Navigation, Check, Loader2 } from 'lucide-react';
import { Location } from '../../types';

interface MapPinModalProps {
  initialLocation: Location;
  onConfirm: (lat: number, lng: number) => void;
  onClose: () => void;
}

// Map Controller to sync center
function MapSync({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    if (map && center.lat && center.lng) {
      map.panTo(center);
    }
  }, [map, center]);
  return null;
}

export function MapPinModal({ initialLocation, onConfirm, onClose }: MapPinModalProps) {
  const fallbackKey = 'AIzaSyAbIv0M35oWeTTRnSw-o6Yz4DY6KxiTEQw';
  
  const [center, setCenter] = useState({ 
    lat: initialLocation.latitude || 13.7563, 
    lng: initialLocation.longitude || 100.5018 
  });
  
  const [markerPos, setMarkerPos] = useState({
    lat: initialLocation.latitude || 13.7563,
    lng: initialLocation.longitude || 100.5018
  });

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Try to get current location if initial doesn't have lat/lng
  useEffect(() => {
    if (!initialLocation.latitude) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCenter({ lat, lng });
          setMarkerPos({ lat, lng });
          setIsLoadingLocation(false);
        },
        () => {
          setIsLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  const handleMapClick = (e: any) => {
    if (e.detail?.latLng) {
      setMarkerPos({
        lat: e.detail.latLng.lat,
        lng: e.detail.latLng.lng
      });
    }
  };

  const handleConfirm = () => {
    onConfirm(markerPos.lat, markerPos.lng);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-white rounded-[28px] overflow-hidden shadow-2xl flex flex-col h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white z-10">
          <div>
            <h3 className="font-extrabold text-[16px] text-slate-800">ปักหมุดจุดเกิดเหตุ</h3>
            <p className="text-[11.5px] text-slate-500 font-medium">เลื่อนแผนที่แล้วแตะเพื่อเลือกพิกัด</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Map Container */}
        <div className="relative flex-1 bg-slate-100">
          {isLoadingLocation && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
              <Loader2 size={32} className="animate-spin text-rose-500 mb-2" />
              <p className="text-sm font-bold text-slate-700">กำลังหาตำแหน่งของคุณ...</p>
            </div>
          )}
          
          <APIProvider apiKey={fallbackKey}>
            <Map
              defaultZoom={16}
              defaultCenter={center}
              mapId="INCIDENT_PICKER_MAP"
              gestureHandling="greedy"
              disableDefaultUI={true}
              onClick={handleMapClick}
            >
              <MapSync center={center} />
              
              <Marker 
                position={markerPos}
                draggable={true}
                onDragEnd={(e) => {
                  if (e.latLng) {
                    setMarkerPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                  }
                }}
              />
            </Map>
          </APIProvider>

          {/* Center User Location Button */}
          <button 
            onClick={() => {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  const lat = pos.coords.latitude;
                  const lng = pos.coords.longitude;
                  setCenter({ lat, lng });
                  setMarkerPos({ lat, lng });
                }
              );
            }}
            className="absolute bottom-6 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-700 hover:text-rose-600 active:scale-95 transition-all z-10 border border-slate-100"
          >
            <Navigation size={20} className="fill-current opacity-80" />
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100 z-10">
          <button 
            onClick={handleConfirm}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-2xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Check size={18} />
            ยืนยันพิกัดนี้
          </button>
        </div>
      </div>
    </div>
  );
}
