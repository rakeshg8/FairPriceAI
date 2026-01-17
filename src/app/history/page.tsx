'use client';

import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Clock, ArrowLeftCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from('user_history')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false });

      if (error) console.error('Error fetching history:', error);
      else {
        setHistory(data);
        setFiltered(data);
      }

      setLoading(false);
    };

    fetchHistory();
  }, [user]);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    setFiltered(
      history.filter(
        (item) =>
          item.product_name.toLowerCase().includes(value) ||
          item.mrp.toString().includes(value)
      )
    );
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-300 hover:text-white">
              <ArrowLeftCircle className="w-8 h-8" />
            </Link>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <Clock className="text-purple-400" /> FairPrice AI — History
            </h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3 mb-10 bg-[#1a1a1a] rounded-xl shadow-sm p-3 border border-gray-800">
          <Search className="text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by product name or MRP..."
            value={search}
            onChange={handleSearch}
            className="w-full bg-transparent border-none text-gray-100 focus:ring-0 placeholder-gray-500"
          />
        </div>

        {/* History Display */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="animate-spin text-purple-500 w-10 h-10" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-400">
            <p className="text-lg">No search history yet.</p>
            <p className="text-sm">Start by analyzing a product on FairPrice AI!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((item, i) => {
              const aiResult = item.ai_result || {};
              const aiText = typeof aiResult === 'object' ? JSON.stringify(aiResult, null, 2) : aiResult;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="shadow-lg hover:shadow-purple-700/20 transition-all bg-[#121212] border border-gray-800">
                    <CardContent className="p-5">
                      <div className="relative overflow-hidden rounded-xl mb-4">
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="rounded-xl w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-100">
                        {item.product_name}
                      </h2>
                      <p className="text-sm text-gray-400 mt-1">
                        <strong>MRP:</strong> ₹{item.mrp}
                      </p>
                      <div className="text-sm text-gray-300 mt-3">
  <strong className="text-gray-200 block mb-1">AI Result:</strong>
  {(() => {
    let parsed;
    try {
      parsed = typeof item.ai_result === 'string'
        ? JSON.parse(item.ai_result)
        : item.ai_result;
    } catch {
      parsed = { error: 'Invalid AI result format' };
    }

    if (parsed.error) return <p>{parsed.error}</p>;

    return (
      <div className="bg-[#1a1a1a] rounded-lg p-3 border border-gray-800 space-y-2">
        <p><span className="text-gray-400">Product:</span> {parsed.product}</p>
        <p><span className="text-gray-400">Verdict:</span> <span className="text-purple-400">{parsed.verdict}</span></p>
        <p><span className="text-gray-400">Given MRP:</span> ₹{parsed.givenMRP}</p>
        <p><span className="text-gray-400">Estimated Total Cost:</span> ₹{parsed.totalEstimatedCost}</p>

        {expanded[item.id] && parsed.components && (
          <div className="mt-3">
            <p className="text-purple-400 font-medium mb-1">Component Breakdown:</p>
            <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
              {parsed.components.map((c, i) => (
                <li key={i}>
                  {c.name}: ₹{c.estimatedCostInINR}
                </li>
              ))}
            </ul>

            {parsed.priceAnalysis && (
              <p className="mt-3 text-gray-400 text-sm italic">
                {parsed.priceAnalysis}
              </p>
            )}
          </div>
        )}

        {parsed.components && (
          <button
            onClick={() => toggleExpand(item.id)}
            className="text-purple-400 hover:text-purple-300 mt-2 text-sm font-medium"
          >
            {expanded[item.id] ? 'Show Less' : 'Show More'}
          </button>
        )}
      </div>
    );
  })()}
</div>

                      <p className="text-xs text-gray-500 mt-3">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} FairPrice AI — Powered by Supabase & Next.js</p>
        </div>
      </div>
    </div>
  );
}
