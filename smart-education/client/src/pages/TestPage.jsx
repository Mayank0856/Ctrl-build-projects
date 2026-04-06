import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiClock, FiZap } from 'react-icons/fi';
import { MdQuiz } from 'react-icons/md';
import api from '../services/api';
import toast from 'react-hot-toast';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Computer Science'];

const MOCK_QUIZ = [
  { question: "What is the derivative of x²?", options: ["2x", "x²", "x", "2"], correctAnswer: "2x" },
  { question: "What is the value of π (pi) approximately?", options: ["3.14", "2.71", "1.41", "1.73"], correctAnswer: "3.14" },
  { question: "What is 7 × 8?", options: ["54", "56", "58", "52"], correctAnswer: "56" },
  { question: "What is the square root of 144?", options: ["10", "11", "12", "13"], correctAnswer: "12" },
  { question: "What is 15% of 200?", options: ["25", "30", "35", "40"], correctAnswer: "30" },
];

const TestPage = () => {
  const [subject, setSubject] = useState('Mathematics');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerRef, setTimerRef] = useState(null);

  const generateQuiz = async () => {
    setGenerating(true);
    setSubmitted(false);
    setAnswers({});
    try {
      const res = await api.post('/test/generate', { subject, totalQuestions: 5 });
      setQuestions(res.data.questions);
    } catch {
      setQuestions(MOCK_QUIZ);
      toast('Using offline quiz - Connect server for AI-generated questions', { icon: '📚' });
    } finally {
      setGenerating(false);
      // Start 5-minute timer
      setTimeLeft(300);
      const ref = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(ref);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimerRef(ref);
    }
  };

  const handleAnswer = (qIdx, answer) => {
    if (!submitted) {
      setAnswers(prev => ({ ...prev, [qIdx]: answer }));
    }
  };

  const handleSubmit = () => {
    if (timerRef) clearInterval(timerRef);
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    setScore(correct);
    setSubmitted(true);
  };

  const formatTime = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl">
            <MdQuiz className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text">Quiz & Tests</h1>
            <p className="text-xs text-muted">AI-generated questions tailored for you</p>
          </div>
        </div>
        {timeLeft !== null && !submitted && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
            timeLeft < 60 ? 'border-danger/50 bg-danger/10 text-danger' : 'border-white/10 bg-surface/50 text-text'
          }`}>
            <FiClock className="w-4 h-4" />
            <span className="font-mono text-sm font-bold">{formatTime(timeLeft)}</span>
          </div>
        )}
      </motion.div>

      {questions.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 text-center">
          <MdQuiz className="w-16 h-16 text-primary/40 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text mb-2">Ready to Test Yourself?</h2>
          <p className="text-muted mb-6">Select a subject and generate an AI-powered quiz</p>

          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {SUBJECTS.map(s => (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  subject === s ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white/5 text-muted hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            id="generate-quiz"
            onClick={generateQuiz}
            disabled={generating}
            className="btn-primary mx-auto inline-flex items-center gap-2 py-3 px-6"
          >
            {generating ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Generating...
              </>
            ) : (
              <><FiZap className="w-4 h-4" /> Generate Quiz</>
            )}
          </button>
        </motion.div>
      ) : submitted ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 text-center">
          <div className={`text-6xl font-black mb-2 ${score >= 4 ? 'text-success' : score >= 2 ? 'text-yellow-400' : 'text-danger'}`}>
            {score}/{questions.length}
          </div>
          <p className="text-muted mb-2">
            {score >= 4 ? '🎉 Excellent work!' : score >= 2 ? '👍 Good effort!' : '📚 Keep practicing!'}
          </p>
          <div className="w-full bg-white/10 rounded-full h-3 mb-6">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(score / questions.length) * 100}%` }}
              className={`h-3 rounded-full ${score >= 4 ? 'bg-success' : score >= 2 ? 'bg-yellow-400' : 'bg-danger'}`}
            />
          </div>

          {/* Review */}
          <div className="space-y-3 text-left mb-6">
            {questions.map((q, i) => (
              <div key={i} className={`p-3 rounded-xl border ${
                answers[i] === q.correctAnswer ? 'border-success/30 bg-success/10' : 'border-danger/30 bg-danger/10'
              }`}>
                <p className="text-sm font-medium text-text mb-1">{i + 1}. {q.question}</p>
                <p className="text-xs text-muted">Your answer: <span className={answers[i] === q.correctAnswer ? 'text-success' : 'text-danger'}>{answers[i] || 'Not answered'}</span></p>
                {answers[i] !== q.correctAnswer && (
                  <p className="text-xs text-success">Correct: {q.correctAnswer}</p>
                )}
              </div>
            ))}
          </div>

          <button id="retake-quiz" onClick={generateQuiz} className="btn-primary">Try Again</button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {questions.map((q, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
                <p className="text-sm font-semibold text-text mb-3">
                  <span className="text-primary mr-2">Q{i + 1}.</span>{q.question}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt, j) => (
                    <button
                      key={j}
                      onClick={() => handleAnswer(i, opt)}
                      className={`p-3 rounded-xl text-sm text-left transition-all border ${
                        answers[i] === opt
                          ? 'border-primary bg-primary/20 text-primary'
                          : 'border-white/10 bg-white/5 text-muted hover:border-white/30 hover:text-white'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted">{Object.keys(answers).length}/{questions.length} answered</p>
            <button
              id="submit-quiz"
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              <FiCheckCircle className="w-4 h-4" /> Submit Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPage;
