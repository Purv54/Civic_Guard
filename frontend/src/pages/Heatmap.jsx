import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, ShieldAlert, Navigation, Filter } from 'lucide-react';
import civicApi from '../services/civicApi';
import { useNavigate } from 'react-router-dom';

const Heatmap = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ high: 0, medium: 0, low: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHeatmap = async () => {
            try {
                const response = await civicApi.getHeatmapData();
                const actualData = Array.isArray(response.data) ? response.data : response.data.results;
                setData(actualData || []);

                // Calculate stats
                const counts = { high: 0, medium: 0, low: 0 };
                (actualData || []).forEach(item => {
                    if (item.risk_score > 70) counts.high++;
                    else if (item.risk_score > 40) counts.medium++;
                    else counts.low++;
                });
                setStats(counts);
            } catch (error) {
                console.error('Heatmap fetch failed:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHeatmap();
    }, []);

    const getColor = (score) => {
        if (score > 70) return '#ef4444'; // Red-500
        if (score > 40) return '#f59e0b'; // Amber-500
        return '#10b981'; // Emerald-500
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-[500px]">
            <div className="text-center">
                <Loader2 className="animate-spin text-primary mx-auto mb-4" size={48} />
                <p className="text-slate-500 font-medium">Loading Civic Intelligence Map...</p>
            </div>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col relative min-h-[500px]">
            {/* Map Header */}
            <div className="bg-white border-b border-slate-100 p-4 shrink-0 flex items-center justify-between shadow-sm z-[1001]">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 flex items-center">
                        <ShieldAlert className="mr-2 text-primary" size={24} />
                        Live Civic Heatmap
                    </h1>
                    <p className="text-xs text-slate-500">Visualizing real-time community hazards and high-risk areas.</p>
                </div>
                <div className="flex space-x-6">
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">High Risk</p>
                        <p className="text-lg font-bold text-red-500">{stats.high}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Moderate</p>
                        <p className="text-lg font-bold text-amber-500">{stats.medium}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Safe</p>
                        <p className="text-lg font-bold text-emerald-500">{stats.low}</p>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative">
                <MapContainer
                    center={[23.0225, 72.5714]}
                    zoom={12}
                    style={{ height: '100%', width: '100%' }}
                    className="z-0"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />

                    {data.map(item => (
                        <CircleMarker
                            key={item.id}
                            center={[item.latitude, item.longitude]}
                            radius={8 + (item.risk_score / 15)}
                            fillColor={getColor(item.risk_score)}
                            color="#fff"
                            weight={2}
                            opacity={1}
                            fillOpacity={0.6}
                        >
                            <Popup className="civic-popup">
                                <div className="p-2 min-w-[200px]">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white`} style={{ backgroundColor: getColor(item.risk_score) }}>
                                            Risk Score: {item.risk_score}
                                        </span>
                                        <span className="text-[10px] text-slate-400 uppercase font-bold">{item.status}</span>
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-sm mb-3">Community Alert #{item.id}</h4>
                                    <button
                                        onClick={() => navigate(`/complaints/${item.id}`)}
                                        className="w-full bg-slate-100 hover:bg-primary hover:text-white py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center"
                                    >
                                        Inspect Details
                                        <Navigation size={12} className="ml-2" />
                                    </button>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}
                </MapContainer>

                {/* Floating Map Controls */}
                <div className="absolute bottom-8 right-8 z-[1000] space-y-3">
                    <button className="bg-white p-3 rounded-2xl shadow-xl border border-slate-100 text-slate-600 hover:text-primary transition-all">
                        <Navigation size={20} />
                    </button>
                    <button className="bg-white p-3 rounded-2xl shadow-xl border border-slate-100 text-slate-600 hover:text-primary transition-all">
                        <Filter size={20} />
                    </button>
                </div>

                {/* Legend */}
                <div className="absolute bottom-8 left-8 z-[1000] bg-white p-4 rounded-2xl shadow-xl border border-slate-100 min-w-[180px]">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Risk Intensity</h4>
                    <div className="space-y-2">
                        <div className="flex items-center text-xs text-slate-600 font-medium">
                            <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                            Severe Danger (&gt;70)
                        </div>
                        <div className="flex items-center text-xs text-slate-600 font-medium">
                            <span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
                            Moderate Alert (40-70)
                        </div>
                        <div className="flex items-center text-xs text-slate-600 font-medium">
                            <span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span>
                            Safe / Monitored (&lt;40)
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Heatmap;
