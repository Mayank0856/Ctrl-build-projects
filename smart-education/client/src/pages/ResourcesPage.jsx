import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiFile, FiBook, FiStar, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { MdInsertDriveFile } from 'react-icons/md';
import api from '../services/api';
import toast from 'react-hot-toast';

const DEMO_SUMMARY = {
  filename: 'chapter5_optics.pdf',
  summary: 'This chapter covers the fundamental principles of optics including reflection, refraction, and the wave nature of light. Key topics include Snell\'s Law, total internal reflection, lenses (converging and diverging), and optical instruments like microscopes and telescopes.',
  importantQuestions: [
    'What is Snell\'s Law and how is it applied?',
    'Explain total internal reflection and its applications.',
    'Differentiate between converging and diverging lenses.',
    'How does a compound microscope work?',
  ],
  keyConcepts: ['Snell\'s Law', 'Total Internal Reflection', 'Refraction Index', 'Lens Formula', 'Optical Instruments'],
};

const ResourcesPage = () => {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [showSummary, setShowSummary] = useState(true);
  const [showQuestions, setShowQuestions] = useState(true);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(f.type)) {
      toast.error('Only PDF and DOCX files are supported');
      return;
    }
    setFile(f);
    setResult(null);
  };

  const processFile = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/materials/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
      toast.success('File processed successfully!');
    } catch {
      // Demo fallback
      await new Promise(r => setTimeout(r, 2000));
      setResult({ ...DEMO_SUMMARY, filename: file.name });
      toast('Using demo result - Connect server for real AI processing', { icon: '📄' });
    } finally {
      setProcessing(false);
    }
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
      toast.success('Reading aloud...');
    } else {
      toast.error('Text-to-Speech not supported in this browser');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-secondary to-primary rounded-xl">
          <FiBook className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text">Resources & AI Study</h1>
          <p className="text-xs text-muted">Upload documents for AI-powered summaries and Q&A</p>
        </div>
      </motion.div>

      {/* Upload Area */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => inputRef.current?.click()}
          className={`glass-card p-10 text-center cursor-pointer transition-all border-2 border-dashed ${
            dragging ? 'border-primary bg-primary/10' : 'border-white/20 hover:border-primary/50 hover:bg-primary/5'
          }`}
        >
          <input ref={inputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
          <FiUploadCloud className={`w-12 h-12 mx-auto mb-3 transition-colors ${dragging ? 'text-primary' : 'text-muted'}`} />
          <p className="text-text font-medium mb-1">
            {file ? file.name : 'Drop your PDF or DOCX here'}
          </p>
          <p className="text-muted text-sm">{file ? `${(file.size / 1024).toFixed(1)} KB` : 'or click to browse'}</p>
        </div>

        {file && !result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center justify-between p-4 bg-surface/50 border border-white/10 rounded-xl">
            <div className="flex items-center gap-3">
              <MdInsertDriveFile className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-text">{file.name}</p>
                <p className="text-xs text-muted">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button
              id="process-file"
              onClick={processFile}
              disabled={processing}
              className="btn-primary flex items-center gap-2"
            >
              {processing ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Processing...</>
              ) : (
                <><FiStar className="w-4 h-4" /> Analyze with AI</>
              )}
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
            {/* Summary */}
            <div className="glass-card p-5">
              <button onClick={() => setShowSummary(!showSummary)} className="w-full flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FiFile className="text-primary" />
                  <span className="font-semibold text-text">AI Summary</span>
                </div>
                {showSummary ? <FiChevronUp className="text-muted" /> : <FiChevronDown className="text-muted" />}
              </button>
              {showSummary && (
                <div>
                  <p className="text-sm text-muted leading-relaxed">{result.summary}</p>
                  <button onClick={() => speak(result.summary)} className="mt-3 text-xs text-primary hover:text-secondary transition-colors flex items-center gap-1">
                    🔊 Read aloud
                  </button>
                </div>
              )}
            </div>

            {/* Key Concepts */}
            {result.keyConcepts?.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="font-semibold text-text flex items-center gap-2 mb-3"><FiStar className="text-accent" /> Key Concepts</h3>
                <div className="flex flex-wrap gap-2">
                  {result.keyConcepts.map((concept, i) => (
                    <span key={i} className="px-3 py-1.5 bg-accent/20 text-accent border border-accent/30 rounded-full text-xs font-medium">
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Important Questions */}
            {result.importantQuestions?.length > 0 && (
              <div className="glass-card p-5">
                <button onClick={() => setShowQuestions(!showQuestions)} className="w-full flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-primary">❓</span>
                    <span className="font-semibold text-text">Important Questions</span>
                  </div>
                  {showQuestions ? <FiChevronUp className="text-muted" /> : <FiChevronDown className="text-muted" />}
                </button>
                {showQuestions && (
                  <ol className="space-y-2">
                    {result.importantQuestions.map((q, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted p-2 rounded-lg hover:bg-white/5 transition-colors">
                        <span className="text-primary font-bold flex-shrink-0">{i + 1}.</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}

            <button onClick={() => { setFile(null); setResult(null); }} className="btn-secondary text-sm">
              Upload Another File
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResourcesPage;
