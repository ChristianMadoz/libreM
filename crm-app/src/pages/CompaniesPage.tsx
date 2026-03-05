import { useState, useEffect } from "react";
import { Search, Plus, Building2, Globe } from "lucide-react";
import { insforge } from "../lib/insforge";

type Company = {
    id: string;
    name: string;
    industry: string;
    website: string;
};

export function CompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchCompanies = async () => {
        setLoading(true);
        const { data, error } = await insforge.database
            .from("companies")
            .select("*")
            .order("name", { ascending: true });

        if (!error && data) {
            setCompanies(data as Company[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const filtered = companies.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Companies</h2>
                    <p className="text-neutral-400">Accounts and organizations you do business with.</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                    <Plus className="w-5 h-5" />
                    Add Company
                </button>
            </div>

            <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/40 backdrop-blur-xl flex-1 flex flex-col overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-neutral-800/60 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Search companies by name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-neutral-950/50 border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-neutral-600"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-neutral-900/50 sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                <th className="px-6 py-4 font-medium text-neutral-400">Company Name</th>
                                <th className="px-6 py-4 font-medium text-neutral-400">Industry</th>
                                <th className="px-6 py-4 font-medium text-neutral-400">Website</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-neutral-500">
                                        Loading companies...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-800/50 mb-3 text-neutral-400">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <p className="text-neutral-300 font-medium">No companies found</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((company) => (
                                    <tr key={company.id} className="hover:bg-neutral-800/30 transition-colors group">
                                        <td className="px-6 py-4 font-semibold text-neutral-200 group-hover:text-white">
                                            {company.name}
                                        </td>
                                        <td className="px-6 py-4 text-neutral-400">
                                            <span className="px-2.5 py-1 rounded bg-neutral-800/50 text-neutral-300 text-xs border border-neutral-700/30">
                                                {company.industry || "—"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-400">
                                            {company.website ? (
                                                <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-indigo-400 transition-colors">
                                                    <Globe className="w-4 h-4" />
                                                    {company.website}
                                                </a>
                                            ) : "—"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
