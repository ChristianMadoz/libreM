import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, DollarSign, Calendar, Building, User } from "lucide-react";
import { insforge } from "../../lib/insforge";
import { cn } from "../../lib/utils";

const STAGES = ["Lead", "Meeting", "Negotiation", "Closed Won", "Closed Lost"];

export function DealsPage() {
    const [deals, setDeals] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // New deal form state
    const [title, setTitle] = useState("");
    const [value, setValue] = useState("");
    const [companyId, setCompanyId] = useState("");
    const [contactId, setContactId] = useState("");
    const [expectedCloseDate, setExpectedCloseDate] = useState("");

    const fetchDeals = async () => {
        setLoading(true);
        const { data, error } = await insforge.database
            .from("deals")
            .select("*, contacts(first_name, last_name), companies(name)");

        if (!error && data) {
            setDeals(data);
        }
        setLoading(false);
    };

    const fetchMetadata = async () => {
        const [compRes, contRes] = await Promise.all([
            insforge.database.from("companies").select("id, name").order("name"),
            insforge.database.from("contacts").select("id, first_name, last_name").order("first_name")
        ]);
        if (compRes.data) setCompanies(compRes.data);
        if (contRes.data) setContacts(contRes.data);
    };

    useEffect(() => {
        fetchDeals();
        fetchMetadata();
    }, []);

    const handleAddDeal = async (e) => {
        e.preventDefault();
        const { error } = await insforge.database
            .from("deals")
            .insert([{
                title,
                value: Number(value),
                company_id: companyId || null,
                contact_id: contactId || null,
                expected_close_date: expectedCloseDate || null,
                stage: "Lead"
            }]);

        if (!error) {
            setTitle("");
            setValue("");
            setCompanyId("");
            setContactId("");
            setExpectedCloseDate("");
            setIsAdding(false);
            fetchDeals();
        }
    };

    const deleteDeal = async (id) => {
        if (!window.confirm("Are you sure you want to delete this deal?")) return;
        const { error } = await insforge.database.from("deals").delete().eq("id", id);
        if (!error) fetchDeals();
    };

    const moveDeal = async (dealId, newStage) => {
        // Optimistic UI update
        setDeals(deals.map((d) => d.id === dealId ? { ...d, stage: newStage } : d));

        // DB update
        const { error } = await insforge.database
            .from("deals")
            .update({ stage: newStage })
            .eq("id", dealId);

        if (error) {
            fetchDeals(); // Revert on error
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Deals Pipeline</h2>
                    <p className="text-neutral-400">Manage your active sales opportunities.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                    <Plus className="w-5 h-5" />
                    Add Deal
                </button>
            </div>

            <div className="flex-1 flex gap-4 overflow-x-auto pb-4 snap-x">
                {STAGES.map((stage) => {
                    const stageDeals = deals.filter((d) => d.stage === stage);
                    const stageTotal = stageDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);

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
                                    ${stageTotal.toLocaleString()}
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
                                            <Link to={`/crm/deals/${deal.id}`} className="absolute inset-0 z-0"></Link>

                                            <div className="relative z-10 flex justify-between items-start mb-2">
                                                <h4 className="font-semibold text-neutral-100 text-sm line-clamp-2 leading-tight">
                                                    {deal.title}
                                                </h4>
                                                <button 
                                                    onClick={(e) => { e.preventDefault(); deleteDeal(deal.id); }}
                                                    className="text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                >
                                                    <span className="text-[10px]">Del</span>
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
                                                         {new Date(deal.expected_close_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
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

            {/* Add Deal Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-neutral-900 border border-neutral-800 w-full max-w-lg rounded-2xl shadow-2xl p-6">
                        <h3 className="text-xl font-bold text-white mb-6">Create New Deal</h3>
                        <form onSubmit={handleAddDeal} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Deal Title</label>
                                <input
                                    autoFocus
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    placeholder="Software Subscription Renewal"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Value ($)</label>
                                    <input
                                        type="number"
                                        required
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        placeholder="5000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Expected Close</label>
                                    <input
                                        type="date"
                                        value={expectedCloseDate}
                                        onChange={(e) => setExpectedCloseDate(e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Related Company</label>
                                <select
                                    value={companyId}
                                    onChange={(e) => setCompanyId(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                                >
                                    <option value="">Select a company...</option>
                                    {companies.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Primary Contact</label>
                                <select
                                    value={contactId}
                                    onChange={(e) => setContactId(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                                >
                                    <option value="">Select a contact...</option>
                                    {contacts.map((c) => (
                                        <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 px-4 py-2 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all font-semibold shadow-lg shadow-indigo-600/20"
                                >
                                    Create Deal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
