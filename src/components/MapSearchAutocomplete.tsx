import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  X, 
  MapPin, 
  Navigation, 
  Utensils, 
  Store, 
  AlertTriangle, 
  Calendar, 
  Compass, 
  Clock, 
  Sparkles,
  Building2,
  Train,
  Check,
  Globe,
  Loader2
} from 'lucide-react';
import { MapPoint } from './modals/PlaceDetailModal';
import { SearchAreaItem, THAILAND_AREAS_DATABASE, WORLDWIDE_AREAS_DATABASE } from '../data/thailandLocations';

export interface AutocompleteResult {
  id: string;
  kind: 'area' | 'place' | 'global' | 'google_place';
  title: string;
  subtitle: string;
  categoryLabel: string;
  iconType: 'area' | 'transit' | 'food' | 'incident' | 'event' | 'shop' | 'custom' | 'google' | 'globe';
  flag?: string;
  lat: number;
  lng: number;
  zoomLevel: number;
  distanceStr?: string;
  rawPlace?: MapPoint;
  rawArea?: SearchAreaItem;
}

interface MapSearchAutocompleteProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  allMapPoints: MapPoint[];
  userLat: number;
  userLng: number;
  onSelectResult: (result: AutocompleteResult) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

const RECENT_SEARCHES_KEY = 'localhub_map_recent_searches';

// Helper to calculate distance string
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  if (d < 1) {
    return `${Math.round(d * 1000)} ม.`;
  }
  if (d > 1000) {
    return `${Math.round(d).toLocaleString()} กม.`;
  }
  return `${d.toFixed(1)} กม.`;
}

// Highlight matching substring
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>;

  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <span>
      {parts.map((part, index) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={index} className="text-emerald-700 bg-emerald-100 font-extrabold px-0.5 rounded">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
}

export function MapSearchAutocomplete({
  searchQuery,
  onSearchQueryChange,
  allMapPoints,
  userLat,
  userLng,
  onSelectResult,
  onClear,
  placeholder = 'ค้นหาพื้นที่ทั่วโลก, เมือง, ตำบล, ร้านอาหาร, จุดเตือนภัย...',
  className = ''
}: MapSearchAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'global' | 'area' | 'food' | 'incident' | 'shop'>('all');
  const [globalApiResults, setGlobalApiResults] = useState<AutocompleteResult[]>([]);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);
  
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      return saved ? JSON.parse(saved) : ['ตำบลเสนานิคม', 'Tokyo, Japan', 'Paris, France', 'ย่านอารีย์'];
    } catch {
      return ['ตำบลเสนานิคม', 'Tokyo, Japan', 'Paris, France', 'ย่านอารีย์'];
    }
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live Worldwide Geocoding Search using OpenStreetMap Nominatim with debouncing
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setGlobalApiResults([]);
      setIsLoadingGlobal(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingGlobal(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&limit=5`,
          {
            headers: {
              'Accept-Language': 'th,en;q=0.9'
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            const formatted: AutocompleteResult[] = data.map((item: any, idx: number) => {
              const lat = parseFloat(item.lat);
              const lon = parseFloat(item.lon);
              const dist = getDistance(userLat, userLng, lat, lon);
              const displayName = item.display_name || item.name;
              const title = item.name || displayName.split(',')[0];
              const subtitle = displayName.length > title.length ? displayName : `${item.type || 'place'}, ${item.address?.country || ''}`;
              
              let zoom = 14;
              if (item.type === 'country') zoom = 5;
              else if (item.type === 'state' || item.type === 'administrative') zoom = 9;
              else if (item.type === 'city') zoom = 12;

              return {
                id: `global_${item.place_id || idx}_${lat}`,
                kind: 'global',
                title: title,
                subtitle: subtitle,
                categoryLabel: item.address?.country || 'ทั่วโลก (Global)',
                iconType: 'globe',
                lat: lat,
                lng: lon,
                zoomLevel: zoom,
                distanceStr: dist
              };
            });
            setGlobalApiResults(formatted);
          }
        }
      } catch (err) {
        console.error('Worldwide Geocoding error:', err);
      } finally {
        setIsLoadingGlobal(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, userLat, userLng]);

  // Save search to history
  const saveRecentSearch = (text: string) => {
    if (!text || text.trim().length < 2) return;
    const clean = text.trim();
    setRecentSearches(prev => {
      const updated = [clean, ...prev.filter(item => item !== clean)].slice(0, 6);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const removeRecentSearch = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    setRecentSearches(prev => {
      const updated = prev.filter(t => t !== item);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Generate ranked search suggestions combining local db + map points + global geocoding
  const suggestions = useMemo<AutocompleteResult[]>(() => {
    const q = searchQuery.toLowerCase().trim();
    const results: AutocompleteResult[] = [];

    // 1. Search Worldwide & Thailand Areas Database
    for (const area of WORLDWIDE_AREAS_DATABASE) {
      const matchName = area.name.toLowerCase().includes(q);
      const matchSubdistrict = area.subdistrict && area.subdistrict.toLowerCase().includes(q);
      const matchDistrict = area.district && area.district.toLowerCase().includes(q);
      const matchProvince = area.province && area.province.toLowerCase().includes(q);
      const matchCountry = area.country && area.country.toLowerCase().includes(q);
      const matchKeywords = area.keywords && area.keywords.some(k => k.toLowerCase().includes(q));

      if (!q || matchName || matchSubdistrict || matchDistrict || matchProvince || matchCountry || matchKeywords) {
        let catLabel = area.country || 'พื้นที่/ย่าน';
        let iconType: AutocompleteResult['iconType'] = 'area';

        if (area.country && area.country !== 'Thailand') {
          catLabel = `${area.flag ? area.flag + ' ' : ''}${area.country}`;
          iconType = 'globe';
        } else if (area.type === 'subdistrict') catLabel = 'ตำบล/แขวง';
        else if (area.type === 'district') catLabel = 'อำเภอ/เขต';
        else if (area.type === 'transit') {
          catLabel = 'สถานีคมนาคม';
          iconType = 'transit';
        } else if (area.type === 'landmark') catLabel = 'แลนด์มาร์ก';

        const dist = getDistance(userLat, userLng, area.lat, area.lng);

        results.push({
          id: `area_${area.id}`,
          kind: 'area',
          title: area.name,
          subtitle: area.description || `${area.subdistrict ? `ต.${area.subdistrict} ` : ''}${area.district ? `อ.${area.district} ` : ''}${area.province ? `จ.${area.province} ` : ''}${area.country || ''}`,
          categoryLabel: catLabel,
          iconType,
          flag: area.flag,
          lat: area.lat,
          lng: area.lng,
          zoomLevel: area.zoomLevel || 15,
          distanceStr: dist,
          rawArea: area
        });
      }
    }

    // 2. Search Map Points (Food, Incident, Event, Shop, Custom Pins)
    for (const pt of allMapPoints) {
      const matchName = pt.name.toLowerCase().includes(q);
      const matchCategory = pt.category && pt.category.toLowerCase().includes(q);
      const matchDesc = pt.description && pt.description.toLowerCase().includes(q);

      if (!q || matchName || matchCategory || matchDesc) {
        let catLabel = pt.category || 'สถานที่';
        let iconType: AutocompleteResult['iconType'] = 'shop';

        if (pt.type === 'food') {
          catLabel = 'ร้านอาหาร/คาเฟ่';
          iconType = 'food';
        } else if (pt.type === 'incident') {
          catLabel = 'จุดเตือนภัย/ซ่อมทาง';
          iconType = 'incident';
        } else if (pt.type === 'event') {
          catLabel = 'กิจกรรม/งานวัด';
          iconType = 'event';
        } else if (pt.isCustomPin) {
          catLabel = 'หมุดของคุณ';
          iconType = 'custom';
        }

        const dist = pt.distance || getDistance(userLat, userLng, pt.lat, pt.lng);

        results.push({
          id: `pt_${pt.id}`,
          kind: 'place',
          title: pt.name,
          subtitle: pt.description || pt.category || 'สถานที่บนแผนที่ชุมชน',
          categoryLabel: catLabel,
          iconType,
          lat: pt.lat,
          lng: pt.lng,
          zoomLevel: 17,
          distanceStr: dist,
          rawPlace: pt
        });
      }
    }

    // 3. Append Dynamic Global Geocoding API Results
    for (const g of globalApiResults) {
      // Deduplicate if already present by approximate coordinates
      const exists = results.some(r => Math.abs(r.lat - g.lat) < 0.005 && Math.abs(r.lng - g.lng) < 0.005);
      if (!exists) {
        results.push(g);
      }
    }

    // Filter by Tab if active
    let filtered = results;
    if (activeFilterTab === 'global') {
      filtered = results.filter(r => r.iconType === 'globe' || r.kind === 'global');
    } else if (activeFilterTab === 'area') {
      filtered = results.filter(r => r.kind === 'area');
    } else if (activeFilterTab === 'food') {
      filtered = results.filter(r => r.iconType === 'food');
    } else if (activeFilterTab === 'incident') {
      filtered = results.filter(r => r.iconType === 'incident');
    } else if (activeFilterTab === 'shop') {
      filtered = results.filter(r => r.iconType === 'shop' || r.iconType === 'custom');
    }

    // Limit to top 15 results for performance
    return filtered.slice(0, 15);
  }, [searchQuery, allMapPoints, userLat, userLng, activeFilterTab, globalApiResults]);

  const handleSelect = (item: AutocompleteResult) => {
    saveRecentSearch(item.title);
    onSearchQueryChange(item.title);
    onSelectResult(item);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelect(suggestions[selectedIndex]);
      } else if (suggestions.length > 0) {
        handleSelect(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Helper to render icon for result
  const renderIcon = (type: AutocompleteResult['iconType'], flag?: string) => {
    if (flag) {
      return (
        <div className="w-8 h-8 rounded-xl bg-slate-100 text-lg flex items-center justify-center shrink-0 border border-slate-200">
          {flag}
        </div>
      );
    }

    switch (type) {
      case 'globe':
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Globe size={16} />
          </div>
        );
      case 'area':
        return (
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
            <Building2 size={16} />
          </div>
        );
      case 'transit':
        return (
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <Train size={16} />
          </div>
        );
      case 'food':
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Utensils size={16} />
          </div>
        );
      case 'incident':
        return (
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={16} />
          </div>
        );
      case 'event':
        return (
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
            <Calendar size={16} />
          </div>
        );
      case 'custom':
        return (
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <MapPin size={16} />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Store size={16} />
          </div>
        );
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input Box */}
      <div className="relative flex items-center shadow-[0_8px_30px_rgba(0,0,0,0.25)] rounded-2xl">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
          {isLoadingGlobal ? (
            <Loader2 size={16} className="animate-spin text-emerald-600" />
          ) : (
            <Search size={16} />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={e => {
            onSearchQueryChange(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2.5 bg-white/95 backdrop-blur-xl rounded-2xl text-[13px] font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 transition-all border border-slate-200 shadow-md placeholder:text-slate-400"
        />

        {searchQuery ? (
          <button
            type="button"
            onClick={() => {
              onClear();
              inputRef.current?.focus();
            }}
            title="ล้างคำค้นหา"
            className="absolute right-2.5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X size={15} />
          </button>
        ) : null}
      </div>

      {/* AUTOCOMPLETE SUGGESTIONS DROPDOWN (Google Maps Worldwide Style) */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white/98 backdrop-blur-2xl rounded-[24px] border border-slate-200/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden z-50 text-slate-900 animate-in fade-in zoom-in-95 duration-150 max-h-[70vh] flex flex-col">
          
          {/* Header filter pills when searching */}
          {searchQuery.trim().length > 0 && (
            <div className="p-2 border-b border-slate-100 bg-slate-50/80 flex items-center gap-1.5 overflow-x-auto hide-scrollbar shrink-0">
              <span className="text-[10.5px] font-extrabold text-slate-400 px-1.5 shrink-0">กรอง:</span>
              <button
                onClick={() => setActiveFilterTab('all')}
                className={`px-2.5 py-1 rounded-xl text-[10.5px] font-extrabold transition-all shrink-0 ${
                  activeFilterTab === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200/70'
                }`}
              >
                ทั้งหมด ({suggestions.length})
              </button>
              <button
                onClick={() => setActiveFilterTab('global')}
                className={`px-2.5 py-1 rounded-xl text-[10.5px] font-extrabold transition-all shrink-0 ${
                  activeFilterTab === 'global'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200/70'
                }`}
              >
                🌍 ทั่วโลก
              </button>
              <button
                onClick={() => setActiveFilterTab('area')}
                className={`px-2.5 py-1 rounded-xl text-[10.5px] font-extrabold transition-all shrink-0 ${
                  activeFilterTab === 'area'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200/70'
                }`}
              >
                🏙️ พื้นที่/ตำบล
              </button>
              <button
                onClick={() => setActiveFilterTab('food')}
                className={`px-2.5 py-1 rounded-xl text-[10.5px] font-extrabold transition-all shrink-0 ${
                  activeFilterTab === 'food'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200/70'
                }`}
              >
                🍜 ร้านอาหาร
              </button>
              <button
                onClick={() => setActiveFilterTab('incident')}
                className={`px-2.5 py-1 rounded-xl text-[10.5px] font-extrabold transition-all shrink-0 ${
                  activeFilterTab === 'incident'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200/70'
                }`}
              >
                🚨 จุดเตือนภัย
              </button>
            </div>
          )}

          {/* SUGGESTIONS LIST */}
          <div className="overflow-y-auto divide-y divide-slate-100/80 flex-1 overscroll-contain">
            
            {/* If Query is empty, show Recent Searches & Popular Global / Local Districts */}
            {!searchQuery.trim() ? (
              <div className="p-3 space-y-3">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-400 mb-1.5 px-1">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        ประวัติการค้นหาล่าสุด
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            onSearchQueryChange(item);
                            inputRef.current?.focus();
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-[11.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5 group"
                        >
                          <Clock size={12} className="text-slate-400 group-hover:text-slate-600" />
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={(e) => removeRecentSearch(e, item)}
                            className="text-slate-300 hover:text-rose-500 p-0.5 rounded-full"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular areas & worldwide landmarks */}
                <div>
                  <div className="flex items-center gap-1 text-[11px] font-extrabold text-slate-400 mb-2 px-1">
                    <Globe size={12} className="text-emerald-500" />
                    <span>พื้นที่ยอดนิยมทั่วโลก & ชุมชน</span>
                  </div>
                  <div className="space-y-1">
                    {WORLDWIDE_AREAS_DATABASE.slice(0, 6).map((area) => {
                      const dist = getDistance(userLat, userLng, area.lat, area.lng);
                      return (
                        <div
                          key={area.id}
                          onClick={() => {
                            handleSelect({
                              id: `area_${area.id}`,
                              kind: 'area',
                              title: area.name,
                              subtitle: area.description || `${area.subdistrict ? `ต.${area.subdistrict} ` : ''}${area.country || ''}`,
                              categoryLabel: area.country || 'พื้นที่/ย่าน',
                              iconType: area.country && area.country !== 'Thailand' ? 'globe' : (area.type === 'transit' ? 'transit' : 'area'),
                              flag: area.flag,
                              lat: area.lat,
                              lng: area.lng,
                              zoomLevel: area.zoomLevel || 14,
                              distanceStr: dist,
                              rawArea: area
                            });
                          }}
                          className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {renderIcon(area.country && area.country !== 'Thailand' ? 'globe' : 'area', area.flag)}
                            <div className="min-w-0">
                              <h4 className="text-[12.5px] font-extrabold text-slate-800 group-hover:text-emerald-700 truncate">
                                {area.name}
                              </h4>
                              <p className="text-[11px] font-medium text-slate-400 truncate">
                                {area.description}
                              </p>
                            </div>
                          </div>
                          <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg shrink-0 ml-2">
                            {dist}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : suggestions.length === 0 ? (
              /* No matching results */
              <div className="py-8 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-2">
                  <Search size={20} />
                </div>
                <h4 className="text-[13.5px] font-extrabold text-slate-800 mb-1">
                  ไม่พบผลการค้นหาสำหรับ "{searchQuery}"
                </h4>
                <p className="text-[11.5px] text-slate-400 max-w-xs mx-auto">
                  ค้นหาได้ทุกเมืองทั่วโลก เช่น Tokyo, London, Paris, New York, เสนานิคม, เชียงใหม่, ภูเก็ต ฯลฯ
                </p>
              </div>
            ) : (
              /* Render Matched Suggestions */
              suggestions.map((item, index) => {
                const isFocused = selectedIndex === index;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`p-3 flex items-center justify-between cursor-pointer transition-all ${
                      isFocused 
                        ? 'bg-emerald-50/80 text-emerald-950' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {renderIcon(item.iconType, item.flag)}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-[13px] font-extrabold text-slate-900 truncate">
                            <HighlightedText text={item.title} query={searchQuery} />
                          </h4>
                          <span className="text-[9.5px] font-extrabold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60 shrink-0">
                            {item.categoryLabel}
                          </span>
                        </div>
                        <p className="text-[11.5px] font-medium text-slate-500 truncate mt-0.5">
                          <HighlightedText text={item.subtitle} query={searchQuery} />
                        </p>
                      </div>
                    </div>

                    {item.distanceStr && (
                      <div className="text-right shrink-0 ml-3">
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                          {item.distanceStr}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-[11px] font-bold text-slate-400 flex items-center justify-between px-3 shrink-0">
            <span className="flex items-center gap-1 text-slate-500">
              <Globe size={13} className="text-emerald-600" />
              <span>ค้นหาครอบคลุมทุกเมืองและทุกพิกัดบนโลก (Worldwide)</span>
            </span>
            <span className="text-[10px] text-slate-400">
              {suggestions.length} ผลลัพธ์
            </span>
          </div>

        </div>
      )}
    </div>
  );
}
