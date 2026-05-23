
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Layout } from './components/Layout';
import { 
  streamAdvancedArchivesSearch, 
  streamGeneticAnalysis, 
  streamAgeProgressionRecords, 
  streamPhotoComparison,
  analyzeQuestionProbability,
  streamPaternityAnalysis
} from './geminiService';
import { SearchResult, SearchFilters, QuestionResult, GroundingSource, PaternityResult } from './types';
import { ADOPTION_SIGNS, REPUTABLE_RESOURCES } from './constants';
import { 
  Search, 
  BookOpen, 
  Link as LinkIcon, 
  ShieldCheck, 
  HelpCircle, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Info,
  Calendar,
  MapPin,
  Filter,
  Dna,
  UserCheck,
  Camera,
  Upload,
  Image as ImageIcon,
  History,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Loader2,
  RefreshCw,
  FileText,
  UserPlus,
  Compass,
  Database,
  Users
} from 'lucide-react';

const LoadingProgress: React.FC<{ messages: string[] }> = ({ messages }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex items-center space-x-3 text-indigo-600 animate-pulse">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm font-medium tracking-wide">{messages[index]}</span>
    </div>
  );
};

const App: React.FC = () => {
  // Archive Search State
  const [keyword, setKeyword] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({ recordType: ['all'] });
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Genetic Analysis State
  const [snpData, setSnpData] = useState('');
  const [geneticResult, setGeneticResult] = useState<SearchResult | null>(null);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const dnaFileInputRef = useRef<HTMLInputElement>(null);

  // Visual Identity State
  const [visualQuery, setVisualQuery] = useState('');
  const [visualResult, setVisualResult] = useState<SearchResult | null>(null);
  const [visualLoading, setVisualLoading] = useState(false);
  const [visualError, setVisualError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Questions State
  const [userQuestion, setUserQuestion] = useState('');
  const [questionResult, setQuestionResult] = useState<QuestionResult | null>(null);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);

  // Paternity State
  const [paternityData, setPaternityData] = useState({ userBT: '', p1BT: '', p2BT: '', traits: '' });
  const [paternityResult, setPaternityResult] = useState<SearchResult | null>(null);
  const [paternityLoading, setPaternityLoading] = useState(false);
  const [paternityError, setPaternityError] = useState<string | null>(null);

  const toggleRecordType = (type: 'archived' | 'commercial' | 'orphan' | 'all') => {
    setFilters(prev => {
      if (type === 'all') return { ...prev, recordType: ['all'] };
      const current = prev.recordType.filter(t => t !== 'all');
      if (current.includes(type)) {
        const next = current.filter(t => t !== type);
        return { ...prev, recordType: next.length ? next : ['all'] };
      }
      return { ...prev, recordType: [...current, type] };
    });
  };

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    setError(null);
    setSearchResult({ text: '', sources: [] });
    
    try {
      const sources = await streamAdvancedArchivesSearch(keyword, filters, (chunk) => {
        setSearchResult(prev => ({ ...prev!, text: (prev?.text || '') + chunk }));
      });
      setSearchResult(prev => ({ ...prev!, sources }));
      scrollToSection('search-results');
    } catch (err: any) {
      setError(err.message || 'Search connection interrupted.');
    } finally {
      setLoading(false);
    }
  }, [keyword, filters]);

  const handleGeneticAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!snpData.trim()) return;

    setGenLoading(true);
    setGenError(null);
    setGeneticResult({ text: '', sources: [] });
    
    try {
      const sources = await streamGeneticAnalysis(snpData, (chunk) => {
        setGeneticResult(prev => ({ ...prev!, text: (prev?.text || '') + chunk }));
      });
      setGeneticResult(prev => ({ ...prev!, sources }));
    } catch (err: any) {
      setGenError(err.message);
    } finally {
      setGenLoading(false);
    }
  };

  const handleRawDnaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setSnpData(content.substring(0, 100000)); // Load a substantial chunk for analysis
      };
      reader.readAsText(file);
    }
  };

  const handlePaternityAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaternityLoading(true);
    setPaternityError(null);
    setPaternityResult({ text: '', sources: [] });
    try {
      const sources = await streamPaternityAnalysis(paternityData, (chunk) => {
        setPaternityResult(prev => ({ ...prev!, text: (prev?.text || '') + chunk }));
      });
      setPaternityResult(prev => ({ ...prev!, sources }));
    } catch (err: any) {
      setPaternityError(err.message);
    } finally {
      setPaternityLoading(false);
    }
  };

  const handleVisualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visualQuery.trim()) return;
    setVisualLoading(true);
    setVisualError(null);
    setVisualResult({ text: '', sources: [] });
    try {
      const sources = await streamAgeProgressionRecords(visualQuery, (chunk) => {
        setVisualResult(prev => ({ ...prev!, text: (prev?.text || '') + chunk }));
      });
      setVisualResult(prev => ({ ...prev!, sources }));
    } catch (err: any) {
      setVisualError(err.message);
    } finally {
      setVisualLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoComparison = async () => {
    if (!uploadedImage) return;
    setVisualLoading(true);
    setVisualError(null);
    setVisualResult({ text: '', sources: [] });
    try {
      const base64Data = uploadedImage.split(',')[1];
      const mimeType = uploadedImage.split(',')[0].split(':')[1].split(';')[0];
      const sources = await streamPhotoComparison(base64Data, mimeType, (chunk) => {
        setVisualResult(prev => ({ ...prev!, text: (prev?.text || '') + chunk }));
      });
      setVisualResult(prev => ({ ...prev!, sources }));
    } catch (err: any) {
      setVisualError(err.message);
    } finally {
      setVisualLoading(false);
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuestion.trim()) return;
    setQuestionLoading(true);
    setQuestionError(null);
    try {
      const result = await analyzeQuestionProbability(userQuestion);
      setQuestionResult(result);
    } catch (err: any) {
      setQuestionError(err.message);
    } finally {
      setQuestionLoading(false);
    }
  };

  const refreshQuestion = () => {
    setQuestionResult(null);
    setUserQuestion('');
    setQuestionError(null);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden py-16 md:py-24 border-b border-slate-100">
        <div className="absolute top-0 right-0 opacity-10">
          <div className="w-96 h-96 rounded-full bg-indigo-600 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <h2 className="serif text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
              The record of your life <br/>
              <span className="text-indigo-600 italic underline decoration-indigo-200">is your property.</span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              Explore elusive historical archives, aged-progression records, and biological markers. KinSeeker empowers you to bridge the gap between rumors and records.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => scrollToSection('how-it-works')} className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition-all flex items-center">
                Get Started <ChevronRight className="ml-2 w-4 h-4" />
              </button>
              <button onClick={() => scrollToSection('search')} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:border-indigo-600 transition-all flex items-center">
                <Search className="mr-2 w-4 h-4 text-indigo-600" /> Archival Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-b border-slate-100 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="serif text-4xl font-bold text-slate-900 mb-4">How KinSeeker Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">We provide a multi-layered investigative toolkit designed to verify identity and uncover hidden biological truths.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                <Database className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Archival Discovery</h3>
              <p className="text-slate-600 leading-relaxed">
                Connects to specialized historical ledgers, orphan asylum archives, and broadcast databases. This tool searches beyond standard public records to find mention of names in elusive archival contexts.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center">
                <Camera className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Visual Verification</h3>
              <p className="text-slate-600 leading-relaxed">
                Uses AI to cross-reference personal photos against historical missing person databases and aged-progression records. It helps identify visual similarities that documented history might miss.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <Dna className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Bio-Marker Insights</h3>
              <p className="text-slate-600 leading-relaxed">
                Analyzes raw SNP/Genetic data for indicators of rare hereditary mutations or intersex-related markers. These can provide biological evidence of a heritage that differs from your legal documentation.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Biological Paternity</h3>
              <p className="text-slate-600 leading-relaxed">
                Evaluates biological probability using blood type Punnett squares and trait inheritance analysis. It detects scientific impossibilities between your biological makeup and that of your documented parents.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Compass className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Discovery Checkpoints</h3>
              <p className="text-slate-600 leading-relaxed">
                A curated guide of common signs—from documentation discrepancies to physical trait anomalies—that have historically led to the discovery of hidden adoption.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Statistical Discovery</h3>
              <p className="text-slate-600 leading-relaxed">
                Leverages community data and historical case analysis to calculate the statistical probability that specific circumstances (like missing pregnancy photos) correlate with an undisclosed adoption.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Search Engine */}
      <section id="search" className="py-20 bg-slate-50 scroll-mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="serif text-3xl font-bold text-slate-900 mb-2">Archival Discovery Engine</h2>
            <p className="text-slate-500">Search specialized ledgers, orphanage records, and broadcast archives.</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden p-8">
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Primary Keywords</label>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="e.g., 'St. Vincent Commercial Orphanage'"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <input
                  type="text"
                  value={filters.location || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Location"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <input
                  type="text"
                  value={filters.dateRange || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  placeholder="Date Range"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="mb-8 flex flex-wrap gap-2">
                {(['all', 'archived', 'commercial', 'orphan'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleRecordType(type)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                      filters.recordType.includes(type) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Discovering Records...' : 'Execute Deep Search'}
              </button>
            </form>
          </div>

          <div id="search-results" className="mt-12">
            {loading && !searchResult?.text && (
              <div className="flex justify-center p-12">
                <LoadingProgress messages={[
                  "Accessing National Archives...",
                  "Scanning Baby Scoop Era ledgers...",
                  "Filtering commercial adoption records...",
                  "Verifying historical news broadcasts..."
                ]} />
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center space-x-3 mb-8">
                <AlertCircle /> <p>{error}</p>
              </div>
            )}

            {searchResult && (searchResult.text || loading) && (
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <BookOpen className="text-indigo-600" /> Archival Analysis
                    {loading && <Loader2 className="w-4 h-4 animate-spin text-indigo-400 ml-2" />}
                  </h3>
                  <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-lg font-light min-h-[100px]">
                    {searchResult.text}
                    {loading && <span className="inline-block w-2 h-5 ml-1 bg-indigo-600 animate-pulse align-middle" />}
                  </div>
                </div>

                {searchResult.sources.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {searchResult.sources.map((s, idx) => (
                      <a key={idx} href={s.uri} target="_blank" rel="noreferrer" className="p-4 bg-white border border-slate-200 rounded-xl flex justify-between hover:border-indigo-400 transition-all">
                        <span className="truncate pr-4 font-semibold text-sm">{s.title}</span> <ExternalLink className="w-4 h-4 text-slate-400" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Visual Identity Hub */}
      <section id="visual" className="py-20 bg-white border-t border-slate-100 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="lg:w-1/3">
              <div className="sticky top-24 space-y-6">
                <h2 className="serif text-3xl font-bold text-slate-900">Visual Identity Hub</h2>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                    <History className="w-4 h-4" /> <span>Age Progression Search</span>
                  </div>
                  <form onSubmit={handleVisualSearch} className="flex gap-2">
                    <input value={visualQuery} onChange={(e) => setVisualQuery(e.target.value)} placeholder="Missing names..." className="flex-grow p-2 text-sm border rounded-lg" />
                    <button type="submit" className="bg-indigo-600 text-white p-2 rounded-lg"><Search className="w-4 h-4"/></button>
                  </form>
                </div>
                <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                  <input type="file" accept="image/*" onChange={handleFileUpload} ref={fileInputRef} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="w-full py-2 bg-white border border-rose-200 text-rose-700 rounded-lg text-sm font-semibold mb-4 flex items-center justify-center gap-2">
                    <ImageIcon className="w-4 h-4"/> Select Photo
                  </button>
                  {uploadedImage && (
                    <button onClick={handlePhotoComparison} disabled={visualLoading} className="w-full py-2 bg-rose-600 text-white rounded-lg font-bold flex items-center justify-center gap-2">
                      {visualLoading ? 'Analyzing...' : 'Execute Visual Match'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:w-2/3 min-h-[400px]">
              {visualLoading && !visualResult?.text && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12">
                   <LoadingProgress messages={["Scanning Doe Network archives...", "Comparing facial biometric markers...", "Accessing historical progression records..."]} />
                </div>
              )}
              {visualResult && (
                <div className="bg-white p-8 rounded-3xl border border-slate-200">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <ShieldCheck className="text-rose-600" /> Comparison Analysis
                    {visualLoading && <Loader2 className="w-4 h-4 animate-spin text-rose-400 ml-2" />}
                  </h3>
                  <div className="text-slate-700 leading-relaxed text-lg font-light">
                    {visualResult.text}
                    {visualLoading && <span className="inline-block w-2 h-5 ml-1 bg-rose-600 animate-pulse align-middle" />}
                  </div>
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {visualResult.sources.map((s, i) => (
                      <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="p-3 bg-slate-50 border rounded-xl flex justify-between hover:border-rose-400">
                        <span className="truncate text-xs font-semibold">{s.title}</span> <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {!visualResult && !visualLoading && (
                <div className="h-full border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-12 text-center text-slate-400">
                  <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                  <p>Visual findings will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Genetic Analysis */}
      <section id="genetics" className="py-20 bg-slate-50 border-t border-slate-100 scroll-mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
            <div className="lg:col-span-2">
              <h2 className="serif text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <Dna className="text-indigo-600" /> Bio-Marker Insights
              </h2>
              <p className="text-slate-600 mb-8 leading-relaxed">Analyze raw DNA for biological heritage, intersex markers, and rare mutations.</p>
              <div className="p-4 bg-white rounded-2xl border border-slate-200">
                <textarea 
                  rows={4} 
                  value={snpData} 
                  onChange={(e) => setSnpData(e.target.value)} 
                  placeholder="Paste SNP data or upload a file..." 
                  className="w-full p-3 text-sm font-mono border-none outline-none resize-none"
                />
                <div className="mt-4 flex flex-col gap-2">
                  <input 
                    type="file" 
                    accept=".txt,.csv" 
                    onChange={handleRawDnaUpload} 
                    ref={dnaFileInputRef} 
                    className="hidden" 
                  />
                  <button 
                    onClick={() => dnaFileInputRef.current?.click()}
                    className="w-full py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold flex justify-center items-center gap-2 hover:bg-indigo-100 transition-colors"
                  >
                    <Upload className="w-4 h-4" /> Upload Raw DNA File
                  </button>
                  <button 
                    onClick={handleGeneticAnalysis} 
                    disabled={genLoading || !snpData} 
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {genLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze Markers'}
                  </button>
                </div>
              </div>
            </div>
            <div className="lg:col-span-3">
              {genLoading && !geneticResult?.text && (
                <div className="p-12 text-center">
                  <LoadingProgress messages={["Accessing ClinVar and SNPedia...", "Scanning for intersex markers...", "Analyzing rare mutations...", "Identifying heritage indicators..."]} />
                </div>
              )}
              {geneticResult && (
                <div className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100 shadow-sm">
                  <h4 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                    <UserCheck className="w-5 h-5" /> Correlation Report
                    {genLoading && <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />}
                  </h4>
                  <div className="text-slate-700 leading-relaxed font-light whitespace-pre-wrap">
                    {geneticResult.text}
                    {genLoading && <span className="inline-block w-2 h-5 ml-1 bg-indigo-600 animate-pulse align-middle" />}
                  </div>
                  <div className="mt-8 grid grid-cols-1 gap-2">
                    {geneticResult.sources.map((s, i) => (
                      <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="p-3 bg-white border border-indigo-200 rounded-xl flex justify-between text-xs font-semibold">
                        {s.title} <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Paternity Analysis */}
      <section id="paternity" className="py-20 bg-white border-t border-slate-100 scroll-mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="serif text-3xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-3">
              <UserPlus className="text-rose-600" /> Biological Paternity Check
            </h2>
            <p className="text-slate-600">Investigate biological links using blood types and physical traits.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
              <form onSubmit={handlePaternityAnalysis} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">User BT</label>
                    <input value={paternityData.userBT} onChange={e => setPaternityData({...paternityData, userBT: e.target.value})} placeholder="O+" className="w-full p-2 border rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Parent 1 BT</label>
                    <input value={paternityData.p1BT} onChange={e => setPaternityData({...paternityData, p1BT: e.target.value})} placeholder="A-" className="w-full p-2 border rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Parent 2 BT</label>
                    <input value={paternityData.p2BT} onChange={e => setPaternityData({...paternityData, p2BT: e.target.value})} placeholder="B+" className="w-full p-2 border rounded-lg text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dominant Traits (Eyes, Hair, etc.)</label>
                  <textarea 
                    rows={3} 
                    value={paternityData.traits} 
                    onChange={e => setPaternityData({...paternityData, traits: e.target.value})} 
                    placeholder="e.g., Both parents have blue eyes, I have dark brown eyes..." 
                    className="w-full p-3 border rounded-lg text-sm resize-none"
                  />
                </div>
                <button type="submit" disabled={paternityLoading} className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold hover:bg-rose-700 disabled:opacity-50">
                  {paternityLoading ? 'Calculating Likelihood...' : 'Analyze Paternity'}
                </button>
              </form>
            </div>

            <div className="min-h-[200px]">
              {paternityLoading && !paternityResult?.text && (
                 <div className="h-full flex items-center justify-center">
                    <LoadingProgress messages={["Calculating Punnett probabilities...", "Analyzing trait inheritance...", "Evaluating genetic anomalies..."]} />
                 </div>
              )}
              {paternityResult && (
                <div className="bg-white p-6 border border-slate-200 rounded-3xl shadow-sm">
                  <h4 className="font-bold text-slate-900 mb-3 text-lg">Biological Analysis Result</h4>
                  <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {paternityResult.text}
                    {paternityLoading && <span className="inline-block w-2 h-4 ml-1 bg-rose-600 animate-pulse align-middle" />}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Discovery Checkpoints (Signs) */}
      <section id="signs" className="py-20 bg-slate-50 border-t border-slate-100 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="serif text-3xl font-bold text-slate-900 mb-4">Discovery Checkpoints</h2>
              <p className="text-slate-600">Common indicators that a biological truth may have been concealed.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ADOPTION_SIGNS.map((sign, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-4 ${
                  sign.type === 'Documentation' ? 'bg-blue-100 text-blue-600' :
                  sign.type === 'Medical' ? 'bg-red-100 text-red-600' :
                  sign.type === 'Physical' ? 'bg-green-100 text-green-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {sign.type === 'Medical' ? <HelpCircle className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                </div>
                <h4 className="font-bold text-slate-900 mb-2">{sign.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{sign.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verification Hub (Resources) */}
      <section id="resources" className="py-20 bg-white border-t border-slate-100 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="serif text-3xl font-bold text-slate-900">Verification Hub</h2>
            <div className="h-px flex-grow mx-8 bg-slate-200 hidden md:block"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {REPUTABLE_RESOURCES.map((resource, idx) => (
              <a 
                key={idx}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-6 bg-slate-50 border border-slate-200 rounded-2xl hover:border-indigo-600 hover:shadow-xl transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    resource.category === 'Medical' ? 'bg-red-100 text-red-700' : 
                    resource.category === 'DNA' ? 'bg-indigo-100 text-indigo-700' : 
                    resource.category === 'Legal' ? 'bg-emerald-100 text-emerald-700' : 
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {resource.category}
                  </span>
                  <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{resource.name}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{resource.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Statistical Discovery */}
      <section id="questions" className="py-20 bg-slate-900 text-white scroll-mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="serif text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <MessageSquare className="text-indigo-400" /> Statistical Discovery
            </h2>
            <p className="text-indigo-100/70">Probability scores based on thousands of shared community experiences.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              {!questionResult ? (
                <form onSubmit={handleQuestionSubmit} className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
                  <textarea 
                    rows={4} 
                    value={userQuestion} 
                    onChange={(e) => setUserQuestion(e.target.value)} 
                    placeholder="Ask about your observation or family history..." 
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl outline-none text-white focus:border-indigo-500"
                  />
                  <button 
                    type="submit" 
                    disabled={questionLoading} 
                    className="w-full bg-indigo-600 py-4 rounded-xl font-bold disabled:opacity-50 hover:bg-indigo-700 transition-colors"
                  >
                    {questionLoading ? 'Analyzing Probability...' : 'Check Probability'}
                  </button>
                </form>
              ) : (
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-grow">
                      <label className="block text-xs font-bold text-indigo-400 uppercase mb-2">Investigation Query</label>
                      <p className="text-white text-lg font-light leading-relaxed italic">"{userQuestion}"</p>
                    </div>
                    <button 
                      onClick={refreshQuestion}
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all shrink-0 group"
                      title="Ask another question"
                    >
                      <RefreshCw className="w-5 h-5 text-indigo-400 group-hover:rotate-180 transition-transform duration-500" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              {questionLoading && !questionResult && (
                <div className="h-full flex items-center justify-center text-indigo-200">
                  <LoadingProgress messages={["Querying community records...", "Scanning shared histories...", "Generating statistical score..."]} />
                </div>
              )}
              {questionResult && !questionLoading && (
                <div className="bg-indigo-600 p-8 rounded-3xl shadow-2xl animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-4xl font-bold">~{questionResult.percentage}%</h4>
                    <BarChart3 className="w-8 h-8 opacity-50" />
                  </div>
                  <div className="h-2 w-full bg-white/20 rounded-full mb-6">
                    <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${questionResult.percentage}%` }}></div>
                  </div>
                  <p className="italic font-light leading-relaxed mb-6">"{questionResult.text}"</p>
                  <p className="text-xs text-indigo-300">Analysis Confidence: {questionResult.confidence}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default App;
