import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, MoreHorizontal, DollarSign, Calendar, Building, User } from "lucide-react";
import { insforge } from "../lib/insforge";
import { format } from "date-fns";
import { cn } from "../lib/utils";

const STAGES = ["Lead", "Meeting", "Negotiation", "Closed Won", "Closed Lost"];

type Deal = {
    id: string;
    title: string;
    value: number;
    stage: string;
    expected_close_date: string;
    contacts?: { first_name: string; last_name: string };
    companies?: { name: string };
};

export function DealsPage() {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDeals = async () => {
        setLoading(true);
        const { data, error } = await insforge.database
            .from("deals")
            .select("*, contacts(first_name, last_name), companies(name)");

        if (!error && data) {
            setDeals(data as any[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDeals();
    }, []);

    const moveDeal = async (dealId: string, newStage: string) => {
        // Optimistic UI update
        setDeals(deals.map(d => d.id === dealId ? { ...d, stage: newStage } : d));

        // DB update
        await insforge.database
            .from("deals")
            .update({ stage: newStage })
            .eq("id", dealId);
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Deals Pipeline</h2>
                    <p className="text-neutral-400">Manage your active sales opportunities.</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                    <Plus className="w-5 h-5" />
                    Add Deal
                </button>
            </div>

            <div className="flex-1 flex gap-4 overflow-x-auto pb-4 snap-x">
                {STAGES.map((stage) => {
                    const stageDeals = deals.filter((d) => (d.stage || "Lead") === stage);
                    const totalValue = stageDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);

                    return (
                        <div key={stage} className="flex-none w-80 flex flex-col h-full bg-neutral-900/30 rounded-2xl border border-neutral-800/50 backdrop-blur-xl snap-center snap-always">
                            <div className="p-4 flex items-center justify-between border-b border-neutral-800/50">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-neutral-100">{stage}</h3>
                                    <span className="bg-neutral-800 text-neutral-300 text-xs px-2 py-0.5 rounded-full font-medium">
                                        {stageDeals.length}
                                    </span>
                                </div>
                                <div className="text-sm font-medium text-neutral-400">
                                    ${totalValue.toLocaleString()}
                                </div>
                            </div>

                            <div className="p-3 flex-1 overflow-y-auto space-y-3">
                                {loading ? (
                                    <div className="text-center text-neutral-500 text-sm py-4">Loading deals...</div>
                                ) : stageDeals.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-neutral-800/60 rounded-xl text-neutral-500 text-sm italic">
                                        No deals
                                    </div>
                                ) : (
                                    stageDeals.map((deal) => (
                                        <div
                                            key={deal.id}
                                            className={cn(
                                                "bg-neutral-950/80 border rounded-xl p-4 shadow-md hover:shadow-xl transition-all group cursor-pointer relative overflow-hidden",
                                                stage === "Closed Won" ? "border-emerald-500/30" :
                                                    stage === "Closed Lost" ? "border-red-500/30" : "border-neutral-800 hover:border-indigo-500/50"
                                            )}
                                        >
                                            <Link to={`/deals/${deal.id}`} className="absolute inset-0 z-0"></Link>

                                            <div className="relative z-10 flex justify-between items-start mb-2">
                                                <h4 className="font-semibold text-neutral-100 text-sm line-clamp-2 leading-tight">
                                                    {deal.title}
                                                </h4>
                                                <button className="text-neutral-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="relative z-10 space-y-2 mt-3">
                                                {deal.companies && (
                                                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                                                        <Building className="w-3.5 h-3.5 text-indigo-400/70" />
                                                        <span className="truncate">{deal.companies.name}</span>
                                                    </div>
                                                )}
                                                {deal.contacts && (
                                                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                                                        <User className="w-3.5 h-3.5 text-purple-400/70" />
                                                        <span className="truncate">{deal.contacts.first_name} {deal.contacts.last_name}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="relative z-10 mt-4 flex items-center justify-between border-t border-neutral-800/60 pt-3">
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                                                    <DollarSign className="w-3.5 h-3.5" />
                                                    {Number(deal.value || 0).toLocaleString()}
                                                </div>
                                                {deal.expected_close_date && (
                                                    <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {format(new Date(deal.expected_close_date), "MMM d")}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Quick stage move logic (optional overlay) */}
                                            <div className="relative z-20 mt-3 pt-3 flex gap-1 justify-end border-t border-neutral-800/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {STAGES.map(s => {
                                                    if (s === stage) return null;
                                                    return (
                                                        <button
                                                            key={s}
                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveDeal(deal.id, s); }}
                                                            className="text-[10px] bg-neutral-800 hover:bg-indigo-600 text-neutral-300 hover:text-white px-2 py-1 rounded transition-colors"
                                                        >
                                                            {s}
                                                        </button>
                                                    )
                                                })}
                                            </div>

                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
