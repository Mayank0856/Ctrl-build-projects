import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiFile, FiBook, FiStar, FiChevronDown, FiChevronUp, FiVolume2, FiDownload } from 'react-icons/fi';
import { MdInsertDriveFile } from 'react-icons/md';
import api from '../services/api';
import toast from 'react-hot-toast';

const ResourcesPage = () => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload', 'my-files', 'admin-materials'
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [showSummary, setShowSummary] = useState(true);
  const [showQuestions, setShowQuestions] = useState(true);
  
  const [myFiles, setMyFiles] = useState([]);
  const [adminMaterials, setAdminMaterials] = useState([]);
  
  const [explanationMode, setExplanationMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [videoJob, setVideoJob] = useState(null);

  const inputRef = useRef(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const myRes = await api.get('/materials');
      setMyFiles(myRes.data);
      // Let's pretend there's an admin endpoint for now (we'll create it later)
      try {
        const adminRes = await api.get('/admin/materials'); 
        setAdminMaterials(adminRes.data);
      } catch (e) {
        // Ignored, maybe not authorized or route not built yet
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFile = (f) => {
    if (!f) return;
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowed.includes(f.type)) {
      toast.error('Only PDF, DOCX, and TXT files are supported');
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
      fetchFiles(); // refresh list
      toast.success('File processed successfully!');
    } catch {
      toast.error('Processing failed. Please check server connection.');
    } finally {
      setProcessing(false);
    }
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      toast.success('Reading aloud...');
    } else {
      toast.error('Text-to-Speech not supported in this browser');
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const requestVideo = async () => {
    try {
      const text = result.easyExplanation || result.summary;
      const res = await api.post('/materials/generate-video', { text });
      setVideoJob({ status: 'processing', id: res.data.jobId });
      
      // Start polling
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await api.get(`/materials/video-status/${res.data.jobId}`);
          if (statusRes.data.status === 'completed' || statusRes.data.status === 'failed') {
            clearInterval(pollInterval);
            setVideoJob(statusRes.data);
            if (statusRes.data.status === 'failed') toast.error('Video generation failed');
            if (statusRes.data.status === 'completed') toast.success('Video Generated!');
          }
        } catch (e) {
          clearInterval(pollInterval);
          toast.error('Error checking video status');
          setVideoJob({ status: 'failed' });
        }
      }, 3000);

    } catch (e) {
      toast.error('Failed to start video generation');
    }
  };

  const viewFileResult = (savedFile) => {
    setResult({
      filename: savedFile.originalName,
      summary: savedFile.summary,
      easyExplanation: savedFile.easyExplanation,
      importantQuestions: savedFile.importantQuestions,
      keyConcepts: savedFile.keyConcepts,
    });
    setActiveTab('upload');
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

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('upload')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'upload' ? 'bg-primary text-white' : 'bg-surface text-muted hover:text-white'}`}>Process Document</button>
        <button onClick={() => setActiveTab('my-files')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'my-files' ? 'bg-primary text-white' : 'bg-surface text-muted hover:text-white'}`}>My Uploads</button>
        <button onClick={() => setActiveTab('admin-materials')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'admin-materials' ? 'bg-primary text-white' : 'bg-surface text-muted hover:text-white'}`}>Library Categories</button>
      </div>

      {activeTab === 'upload' && (
      <React.Fragment>
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
          <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
          <FiUploadCloud className={`w-12 h-12 mx-auto mb-3 transition-colors ${dragging ? 'text-primary' : 'text-muted'}`} />
          <p className="text-text font-medium mb-1">
            {file ? file.name : 'Drop your PDF, DOCX or TXT here'}
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
            
            {/* Interactive Explanation Mode Toggle */}
            <div className="flex justify-end gap-2 mb-2">
              <button 
                onClick={() => setExplanationMode(!explanationMode)} 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${explanationMode ? 'bg-accent text-white' : 'bg-white/5 border border-white/10 text-muted hover:text-white'}`}
              >
                <FiVolume2 /> {explanationMode ? 'Exit Explanation Mode' : 'Start Slideshow Mode'}
              </button>
            </div>

            {explanationMode ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 border-accent/30 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-accent/5 pointer-events-none"></div>
                <h2 className="text-2xl font-bold text-text mb-4">Learn: {result.filename}</h2>
                <div className="text-left bg-black/40 p-6 rounded-xl mb-6">
                  <p className="text-lg leading-relaxed text-white/90">
                    {result.easyExplanation || result.summary}
                  </p>
                </div>
                <div className="flex justify-center gap-4">
                  {isSpeaking ? (
                    <button onClick={stopSpeaking} className="btn-secondary">Stop Narration</button>
                  ) : (
                    <button onClick={() => speak(result.easyExplanation || result.summary)} className="btn-primary">Narrate Explanation</button>
                  )}
                </div>
              </motion.div>
            ) : (
             <>
            {/* Ask for MP4 Video Animation */}
            {(!videoJob || videoJob.status === 'failed') && (
              <div className="glass-card p-5 border-accent/30 bg-gradient-to-r from-accent/10 to-transparent flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-text text-lg">Want an animated explainer?</h3>
                  <p className="text-sm text-muted">Generate a real 2D animated MP4 video with an AI Tutor voiceover.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setVideoJob(null)} className="btn-secondary text-sm">NO</button>
                  <button onClick={requestVideo} className="btn-primary text-sm flex items-center gap-2">
                    YES, Generate Video
                  </button>
                </div>
              </div>
            )}

            {/* Video Polling/Player */}
            {videoJob && videoJob.status === 'processing' && (
              <div className="glass-card p-8 text-center border-primary/30">
                <span className="w-8 h-8 border-4 border-white/20 border-t-primary rounded-full animate-spin mx-auto block mb-4"></span>
                <h3 className="text-lg font-bold text-text animate-pulse">Rendering Video...</h3>
                <p className="text-sm text-muted">This may take up to 2 minutes as we stitch together the script, voice, and character.</p>
              </div>
            )}

            {videoJob && videoJob.status === 'completed' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-4 overflow-hidden border-success/30">
                <h3 className="font-bold text-text mb-3">Your Animated Explainer</h3>
                <video src={`http://localhost:5000${videoJob.url}`} controls autoPlay className="w-full rounded-lg bg-black object-contain max-h-[400px]"></video>
              </motion.div>
            )}

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
            </>
            )}

            <button onClick={() => { setFile(null); setResult(null); stopSpeaking(); setExplanationMode(false); setVideoJob(null); }} className="btn-secondary text-sm w-full mt-4">
              Upload Another File
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      </React.Fragment>
      )}

      {/* My Files Tab */}
      {activeTab === 'my-files' && (
        <div className="space-y-4">
          {myFiles.length === 0 ? (
            <p className="text-muted text-center py-8">No uploaded files yet.</p>
          ) : (
            myFiles.map(f => (
              <div key={f._id} className="glass-card p-4 flex items-center justify-between hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <MdInsertDriveFile className="w-6 h-6 text-primary" />
                  <div>
                    <h4 className="font-semibold text-sm text-text">{f.originalName}</h4>
                    <p className="text-xs text-muted">{new Date(f.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button onClick={() => viewFileResult(f)} className="text-xs text-primary hover:text-accent font-medium px-3 py-1.5 bg-primary/10 rounded-lg">
                  View Study Material
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Admin Materials Tab */}
      {activeTab === 'admin-materials' && (
        <div className="space-y-4">
           {adminMaterials.length === 0 ? (
            <p className="text-muted text-center py-8">No library categories available from admin yet.</p>
          ) : (
            adminMaterials.map(cat => (
              <div key={cat._id} className="glass-card p-4">
                <h3 className="font-bold text-text mb-2 text-lg border-b border-white/10 pb-2">{cat.name}</h3>
                {cat.materials?.length === 0 ? <p className="text-xs text-muted">Empty category.</p> : null}
                <div className="space-y-2 mt-2">
                  {cat.materials?.map(m => (
                    <div key={m._id} className="flex items-center justify-between bg-white/5 p-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FiFile className="text-muted" />
                        <div>
                          <p className="text-sm font-medium text-text">{m.title}</p>
                          <p className="text-xs text-muted">{m.description}</p>
                        </div>
                      </div>
                      <a href={`http://localhost:5000${m.fileUrl}`} target="_blank" rel="noreferrer" className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                        <FiDownload className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};

export default ResourcesPage;
