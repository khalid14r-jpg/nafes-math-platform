import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  Settings, 
  ChevronLeft, 
  Star, 
  Award, 
  BrainCircuit,
  Timer,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BarChart3,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { MOCK_QUESTIONS, Question, UserStats, BADGES } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ChatBot from './components/ChatBot';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'topics' | 'quiz' | 'leaderboard' | 'stats'>('dashboard');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [currentQuestionText, setCurrentQuestionText] = useState<string | undefined>(undefined);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [stats, setStats] = useState<UserStats>({
    points: 1250,
    level: 5,
    badges: [BADGES[0]],
    completedQuizzes: 12,
    topicPerformance: {
      "الأعداد والعمليات": 85,
      "الجبر": 70,
      "الهندسة": 90,
      "القياس": 65,
      "الإحصاء والاحتمالات": 80
    }
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} onStartQuiz={() => setActiveTab('topics')} />;
      case 'topics':
        return <Topics onSelectTopic={(topic) => {
          setSelectedTopic(topic);
          setActiveTab('quiz');
        }} />;
      case 'quiz':
        const filteredQuestions = selectedTopic 
          ? MOCK_QUESTIONS.filter(q => q.topic === selectedTopic)
          : MOCK_QUESTIONS;
        return <Quiz 
          questions={filteredQuestions} 
          topicName={selectedTopic}
          onQuestionChange={(text) => setCurrentQuestionText(text)}
          onOpenChat={() => setIsChatOpen(true)}
          onComplete={(points) => {
            setStats(prev => ({ ...prev, points: prev.points + points, completedQuizzes: prev.completedQuizzes + 1 }));
            setActiveTab('dashboard');
            setSelectedTopic(null);
            setCurrentQuestionText(undefined);
          }} 
          onBack={() => {
            setActiveTab('topics');
            setSelectedTopic(null);
            setCurrentQuestionText(undefined);
          }}
        />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'stats':
        return <Stats stats={stats} />;
      default:
        return <Dashboard stats={stats} onStartQuiz={() => setActiveTab('quiz')} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <nav className="w-full md:w-64 bg-white border-l border-slate-200 p-4 flex flex-row md:flex-col gap-2 z-50">
        <div className="hidden md:flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
            <BrainCircuit size={24} />
          </div>
          <h1 className="font-bold text-xl text-primary">نافس بلس</h1>
        </div>

        <NavItem 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
          icon={<LayoutDashboard size={20} />} 
          label="الرئيسية" 
        />
        <NavItem 
          active={activeTab === 'topics' || activeTab === 'quiz'} 
          onClick={() => setActiveTab('topics')} 
          icon={<BookOpen size={20} />} 
          label="مركز التدريب" 
        />
        <NavItem 
          active={activeTab === 'stats'} 
          onClick={() => setActiveTab('stats')} 
          icon={<BarChart3 size={20} />} 
          label="أدائي" 
        />
        <NavItem 
          active={activeTab === 'leaderboard'} 
          onClick={() => setActiveTab('leaderboard')} 
          icon={<Trophy size={20} />} 
          label="المتصدرون" 
        />
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">أهلاً بك يا بطل! 👋</h2>
            <p className="text-slate-500">مستعد لتحدي الرياضيات اليوم؟</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-accent/10 text-accent px-4 py-2 rounded-2xl flex items-center gap-2 font-bold">
              <Star size={18} fill="currentColor" />
              <span>{stats.points} نقطة</span>
            </div>
            <div className="w-12 h-12 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
      <ChatBot 
        currentQuestion={currentQuestionText} 
        isOpen={isChatOpen} 
        setIsOpen={setIsChatOpen} 
      />
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 w-full text-right",
        active 
          ? "bg-primary text-white shadow-lg shadow-primary/20" 
          : "text-slate-500 hover:bg-slate-50 hover:text-primary"
      )}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function Dashboard({ stats, onStartQuiz }: { stats: UserStats, onStartQuiz: () => void }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Welcome Card */}
      <div className="lg:col-span-2 bg-gradient-to-br from-primary to-blue-600 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10">
          <h3 className="text-3xl font-bold mb-4">استعد لاختبار نافس! 🚀</h3>
          <p className="text-blue-100 mb-8 max-w-md">
            اختر القسم الذي تريد التدرب عليه وابدأ رحلة التفوق في الرياضيات.
          </p>
          <button 
            onClick={onStartQuiz}
            className="bg-white text-primary px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform flex items-center gap-2"
          >
            استعرض الأقسام
            <ChevronLeft size={20} />
          </button>
        </div>
        <div className="absolute left-0 bottom-0 w-64 h-64 opacity-20 pointer-events-none">
          <BrainCircuit size={256} />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="space-y-6">
        <div className="math-card flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
            <Award size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm">المستوى الحالي</p>
            <p className="text-xl font-bold">المستوى {stats.level}</p>
          </div>
        </div>
        <div className="math-card flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm">الاختبارات المكتملة</p>
            <p className="text-xl font-bold">{stats.completedQuizzes} اختبار</p>
          </div>
        </div>
      </div>

      {/* Topics Progress */}
      <div className="lg:col-span-2 math-card">
        <h4 className="text-lg font-bold mb-6">تقدمك في المواضيع</h4>
        <div className="space-y-6">
          {Object.entries(stats.topicPerformance).map(([topic, percent]) => (
            <div key={topic}>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">{topic}</span>
                <span className="text-sm font-bold text-primary">{percent}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="math-card">
        <h4 className="text-lg font-bold mb-6">أوسمتي</h4>
        <div className="grid grid-cols-2 gap-4">
          {BADGES.map((badge) => {
            const isOwned = stats.badges.some(b => b.id === badge.id);
            return (
              <div 
                key={badge.id} 
                className={cn(
                  "flex flex-col items-center p-4 rounded-2xl border-2 transition-all",
                  isOwned ? "bg-accent/5 border-accent/20" : "bg-slate-50 border-transparent opacity-40 grayscale"
                )}
              >
                <span className="text-3xl mb-2">{badge.icon}</span>
                <p className="text-xs font-bold text-center">{badge.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Topics({ onSelectTopic }: { onSelectTopic: (topic: string) => void }) {
  const topics = [
    { name: "الأعداد والعمليات", icon: "🔢", color: "bg-blue-100 text-blue-600", desc: "الأنماط، الكسور، والنسب المئوية" },
    { name: "الكسور والعشريات", icon: "🍰", color: "bg-orange-100 text-orange-600", desc: "العمليات على الكسور والأعداد العشرية" },
    { name: "الجبر", icon: "✖️", color: "bg-purple-100 text-purple-600", desc: "الدوال والمعادلات البسيطة" },
    { name: "الهندسة", icon: "📐", color: "bg-green-100 text-green-600", desc: "الزوايا، الأشكال، والتحويلات" },
    { name: "القياس", icon: "📏", color: "bg-red-100 text-red-600", desc: "المحيط، المساحة، والحجم" },
    { name: "الإحصاء والاحتمالات", icon: "📊", color: "bg-yellow-100 text-yellow-600", desc: "تمثيل البيانات والاحتمالات" },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold mb-2">مركز التدريب 📚</h3>
        <p className="text-slate-500">اختر القسم الذي تريد البدء به</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <button 
            key={topic.name}
            onClick={() => onSelectTopic(topic.name)}
            className="math-card text-right hover:scale-[1.02] active:scale-95 transition-all group"
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform", topic.color)}>
              {topic.icon}
            </div>
            <h4 className="text-xl font-bold mb-2">{topic.name}</h4>
            <p className="text-slate-500 text-sm mb-6">{topic.desc}</p>
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <span>ابدأ التدريب</span>
              <ChevronLeft size={16} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Quiz({ questions, topicName, onComplete, onBack, onQuestionChange, onOpenChat }: { questions: Question[], topicName: string | null, onComplete: (points: number) => void, onBack: () => void, onQuestionChange: (text: string) => void, onOpenChat: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    onQuestionChange(currentQuestion.text);
  }, [currentIndex, currentQuestion.text, onQuestionChange]);

  useEffect(() => {
    if (showResult) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          setShowResult(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showResult]);

  const handleAnswer = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    if (option === currentQuestion.correctAnswer) {
      setScore(prev => prev + 100);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#3b82f6', '#10b981', '#f59e0b']
      });
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-24 h-24 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy size={48} />
        </div>
        <h3 className="text-3xl font-bold mb-2">أحسنت يا بطل! 🌟</h3>
        <p className="text-slate-500 mb-8">لقد أكملت تدريب {topicName || 'الرياضيات'} وحصلت على:</p>
        <div className="text-6xl font-black text-primary mb-8">{score} نقطة</div>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="math-card">
            <p className="text-slate-500 text-sm">الإجابات الصحيحة</p>
            <p className="text-2xl font-bold text-green-600">{score / 100} / {questions.length}</p>
          </div>
          <div className="math-card">
            <p className="text-slate-500 text-sm">الوقت المستغرق</p>
            <p className="text-2xl font-bold text-blue-600">{Math.floor((300 - timeLeft) / 60)}:{(300 - timeLeft) % 60}</p>
          </div>
        </div>
        <button 
          onClick={() => onComplete(score)}
          className="bg-primary text-white px-12 py-4 rounded-2xl font-bold hover:scale-105 transition-transform"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Quiz Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
            <ChevronLeft size={20} className="rotate-180" />
          </button>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{topicName || currentQuestion.topic}</p>
            <h4 className="font-bold">تدريب نافس</h4>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-600 font-mono font-bold bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <Timer size={18} />
          <span>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
        </div>
      </div>

      {/* Help Banner */}
      {!isAnswered && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Bot size={20} />
            </div>
            <p className="text-sm text-blue-800 font-medium">هل تحتاج إلى تلميح للحل؟ اسأل المساعد الذكي!</p>
          </div>
          <button 
            className="text-blue-600 font-bold text-sm hover:underline"
            onClick={onOpenChat}
          >
            كيف أبدأ؟
          </button>
        </div>
      )}

      {/* Progress Bar */}
      <div className="h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          className="h-full bg-primary rounded-full"
        />
      </div>

      {/* Question Card */}
      <motion.div 
        key={currentIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="math-card p-8 md:p-12"
      >
        <div className="flex justify-between items-center mb-8">
          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold">سؤال {currentIndex + 1} من {questions.length}</span>
          <span className={cn(
            "px-3 py-1 rounded-lg text-xs font-bold",
            currentQuestion.difficulty === 'easy' ? "bg-green-100 text-green-600" :
            currentQuestion.difficulty === 'medium' ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"
          )}>
            {currentQuestion.difficulty === 'easy' ? 'سهل' : currentQuestion.difficulty === 'medium' ? 'متوسط' : 'صعب'}
          </span>
        </div>

        <h3 className="text-2xl font-bold mb-12 text-slate-800 leading-relaxed text-center">
          {currentQuestion.text}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => {
            const isCorrect = option === currentQuestion.correctAnswer;
            const isSelected = selectedOption === option;
            
            return (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={isAnswered}
                className={cn(
                  "p-6 rounded-2xl border-2 text-lg font-bold transition-all duration-200 flex items-center justify-between",
                  !isAnswered && "bg-slate-50 border-slate-100 hover:border-primary hover:bg-white hover:shadow-lg",
                  isAnswered && isCorrect && "bg-green-50 border-green-500 text-green-700",
                  isAnswered && isSelected && !isCorrect && "bg-red-50 border-red-500 text-red-700",
                  isAnswered && !isSelected && !isCorrect && "opacity-50 border-transparent"
                )}
              >
                <span>{option}</span>
                {isAnswered && isCorrect && <CheckCircle2 size={24} className="text-green-500" />}
                {isAnswered && isSelected && !isCorrect && <XCircle size={24} className="text-red-500" />}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {isAnswered && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-200"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <h5 className="font-bold mb-1 text-blue-900">شرح الحل:</h5>
                  <p className="text-slate-600 leading-relaxed">{currentQuestion.explanation}</p>
                </div>
              </div>
              <button 
                onClick={nextQuestion}
                className="w-full mt-6 bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
              >
                {currentIndex < questions.length - 1 ? 'السؤال التالي' : 'إنهاء الاختبار'}
                <ArrowRight size={20} className="rotate-180" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function Leaderboard() {
  const leaders = [
    { name: "أحمد محمد", points: 4500, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed" },
    { name: "سارة خالد", points: 4200, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sara" },
    { name: "ياسر فهد", points: 3900, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yasser" },
    { name: "نورة علي", points: 3500, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Noura" },
    { name: "فيصل سعد", points: 3100, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Faisal" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold mb-2">لوحة الصدارة 🏆</h3>
        <p className="text-slate-500">أفضل الطلاب المجتهدين لهذا الأسبوع</p>
      </div>

      <div className="space-y-4">
        {leaders.map((leader, index) => (
          <div 
            key={index} 
            className={cn(
              "math-card flex items-center gap-4 p-4",
              index === 0 && "border-accent bg-accent/5"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
              index === 0 ? "bg-accent text-white" : "bg-slate-100 text-slate-500"
            )}>
              {index + 1}
            </div>
            <img src={leader.avatar} alt={leader.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" referrerPolicy="no-referrer" />
            <div className="flex-1">
              <p className="font-bold">{leader.name}</p>
              <p className="text-xs text-slate-500">طالب متميز</p>
            </div>
            <div className="text-right">
              <p className="font-black text-primary">{leader.points}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">نقطة</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stats({ stats }: { stats: UserStats }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="math-card text-center">
          <p className="text-slate-500 text-sm mb-1">إجمالي النقاط</p>
          <p className="text-4xl font-black text-primary">{stats.points}</p>
        </div>
        <div className="math-card text-center">
          <p className="text-slate-500 text-sm mb-1">المستوى</p>
          <p className="text-4xl font-black text-secondary">{stats.level}</p>
        </div>
        <div className="math-card text-center">
          <p className="text-slate-500 text-sm mb-1">دقة الإجابة</p>
          <p className="text-4xl font-black text-accent">78%</p>
        </div>
      </div>

      <div className="math-card">
        <h4 className="text-lg font-bold mb-8">تحليل الأداء حسب الموضوع</h4>
        <div className="space-y-8">
          {Object.entries(stats.topicPerformance).map(([topic, percent]) => (
            <div key={topic}>
              <div className="flex justify-between items-end mb-3">
                <div>
                  <span className="text-sm font-bold text-slate-700 block mb-1">{topic}</span>
                  <span className="text-xs text-slate-400">
                    {percent > 80 ? 'ممتاز جداً' : percent > 60 ? 'جيد، يحتاج تدريب' : 'يحتاج تركيز أكثر'}
                  </span>
                </div>
                <span className="text-xl font-black text-primary">{percent}%</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  className={cn(
                    "h-full rounded-full",
                    percent > 80 ? "bg-green-500" : percent > 60 ? "bg-blue-500" : "bg-orange-500"
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
