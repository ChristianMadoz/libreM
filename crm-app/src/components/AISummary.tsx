import { useState, useEffect } from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { insforge } from "../lib/insforge";

import { Deal, Note, Task } from "../types";

interface AISummaryProps {
    deal: Deal;
    notes: Note[];
    tasks: Task[];
}

export function AISummary({ deal, notes, tasks }: AISummaryProps) {
    const [summary, setSummary] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateSummary = async () => {
        setLoading(true);
        setError(null);
        try {
            const prompt = `
                Analyze this CRM deal and provide a concise (2-3 sentences) executive summary and a "Next Best Action" recommendation.
                
                Deal Title: ${deal.title}
                Value: $${deal.value}
                Stage: ${deal.stage}
                Company: ${deal.companies?.name || "N/A"}
                Contact: ${deal.contacts ? `${deal.contacts.first_name} ${deal.contacts.last_name}` : "N/A"}
                
                Recent Notes:
                ${notes.slice(0, 5).map(n => `- ${n.content}`).join("\n")}
                
                Pending Tasks:
                ${tasks.filter(t => !t.is_completed).map(t => `- ${t.title}`).join("\n")}
                
                Format:
                Summary: [Summary text]
                Recommendation: [Actionable recommendation]
            `;

            const { data, error: aiError } = await insforge.ai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are a senior CRM sales assistant. Be professional, concise, and focused on deal closure." },
                    { role: "user", content: prompt }
                ]
            });

            if (aiError) throw new Error(aiError.message);
            setSummary(data.choices[0].message.content);
        } catch (err: any) {
            setError(err.message || "Failed to generate AI insight");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (deal && !summary) {
            generateSummary();
        }
    }, [deal]);

    if (!deal) return null;

    return (
        <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 backdrop-blur-xl rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="w-12 h-12 text-indigo-400" />
            </div>

            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    AI Deal Intelligence
                </h3>
                <button 
                    onClick={generateSummary}
                    disabled={loading}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-neutral-400 hover:text-white transition-colors"
                    title="Regenerate"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-6 space-y-3">
                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                    <p className="text-sm text-neutral-400 animate-pulse">Analyzing deal data...</p>
                </div>
            ) : error ? (
                <div className="py-4">
                    <p className="text-sm text-red-400/80 bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                        {error}
                    </p>
                </div>
            ) : summary ? (
                <div className="space-y-4">
                    <div className="prose prose-invert prose-sm max-w-none">
                        <p className="text-neutral-200 leading-relaxed whitespace-pre-wrap">
                            {summary}
                        </p>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
