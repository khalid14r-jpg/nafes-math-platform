import { Type } from "@google/genai";

export interface Question {
  id: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface UserStats {
  points: number;
  level: number;
  badges: Badge[];
  completedQuizzes: number;
  topicPerformance: Record<string, number>;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const MOCK_QUESTIONS: Question[] = [
  {
    id: "f1",
    topic: "الكسور والعشريات",
    difficulty: "easy",
    text: "ما هو الكسر العشري الذي يمثل الكسر الاعتيادي ٣/٤؟",
    options: ["٠,٢٥", "٠,٥٠", "٠,٧٥", "٠,٨٠"],
    correctAnswer: "٠,٧٥",
    explanation: "لتحويل ٣/٤ إلى كسر عشري، نقسم ٣ على ٤ أو نضرب البسط والمقام في ٢٥ ليصبح ٧٥/١٠٠ وهو ٠,٧٥."
  },
  {
    id: "f2",
    topic: "الكسور والعشريات",
    difficulty: "medium",
    text: "أي من الكسور العشرية التالية هو الأكبر قيمة؟",
    options: ["٠,٥", "٠,٤٥", "٠,٥٥", "٠,٠٥"],
    correctAnswer: "٠,٥٥",
    explanation: "عند المقارنة، نوازن المنازل العشرية: ٠,٥٠، ٠,٤٥، ٠,٥٥، ٠,٠٥. نجد أن ٠,٥٥ هو الأكبر."
  },
  {
    id: "f3",
    topic: "الكسور والعشريات",
    difficulty: "medium",
    text: "ناتج جمع ٤,٥ + ٢,٧٥ هو:",
    options: ["٦,٢٥", "٧,٢٥", "٦,٧٥", "٧,٥٠"],
    correctAnswer: "٧,٢٥",
    explanation: "نجمع الأعداد: ٤,٥٠ + ٢,٧٥ = ٧,٢٥. (تأكد من محاذاة الفواصل العشرية)."
  },
  {
    id: "f4",
    topic: "الكسور والعشريات",
    difficulty: "medium",
    text: "اشترى فهد قلماً بسعر ٣,٥ ريال ودفتراً بسعر ٥,٧٥ ريال. كم ريالاً دفع فهد؟",
    options: ["٨,٢٥", "٩,٢٥", "٩,٥٠", "٨,٧٥"],
    correctAnswer: "٩,٢٥",
    explanation: "نجمع ثمن القلم والدفتر: ٣,٥٠ + ٥,٧٥ = ٩,٢٥ ريال."
  },
  {
    id: "f5",
    topic: "الكسور والعشريات",
    difficulty: "hard",
    text: "ما هو ناتج ضرب ٠,٢ × ٠,٣؟",
    options: ["٠,٦", "٠,٠٦", "٦,٠", "٠,٠٠٦"],
    correctAnswer: "٠,٠٦",
    explanation: "نضرب ٢ × ٣ = ٦، ثم نضع الفاصلة بعد خانتين عشريتين (خانة من كل عدد) فيصبح الناتج ٠,٠٦."
  },
  {
    id: "f6",
    topic: "الكسور والعشريات",
    difficulty: "easy",
    text: "تبسيط الكسر ١٢/١٨ في أبسط صورة هو:",
    options: ["٢/٣", "٣/٤", "١/٢", "٤/٦"],
    correctAnswer: "٢/٣",
    explanation: "نقسم البسط والمقام على القاسم المشترك الأكبر وهو ٦: (١٢÷٦)/(١٨÷٦) = ٢/٣."
  },
  {
    id: "f7",
    topic: "الكسور والعشريات",
    difficulty: "medium",
    text: "تحويل الكسر غير الفعلي ٧/٣ إلى عدد كسري هو:",
    options: ["١/٣ ٢", "٢/٣ ٢", "١/٣ ١", "٢/٣ ١"],
    correctAnswer: "١/٣ ٢",
    explanation: "٧ تقسيم ٣ يساوي ٢ والباقي ١، لذا يكتب ٢ و ١/٣."
  },
  {
    id: "f8",
    topic: "الكسور والعشريات",
    difficulty: "medium",
    text: "ما هو ناتج ضرب ١/٢ × ٣/٤؟",
    options: ["٤/٦", "٣/٨", "٢/٨", "٣/٦"],
    correctAnswer: "٣/٨",
    explanation: "نضرب البسط في البسط (١×٣=٣) والمقام في المقام (٢×٤=٨)، الناتج ٣/٨."
  },
  {
    id: "f9",
    topic: "الكسور والعشريات",
    difficulty: "easy",
    text: "ما هو مقلوب الكسر ٥/٦؟",
    options: ["٥/٦", "١/٦", "٦/٥", "٥/١"],
    correctAnswer: "٦/٥",
    explanation: "مقلوب الكسر هو تبديل البسط بالمقام، فيصبح ٦/٥."
  },
  {
    id: "f10",
    topic: "الكسور والعشريات",
    difficulty: "hard",
    text: "ناتج قسمة ١/٢ ÷ ١/٤ هو:",
    options: ["١/٨", "٢", "١/٢", "٤"],
    correctAnswer: "٢",
    explanation: "لقسمة الكسور، نضرب الكسر الأول في مقلوب الثاني: ١/٢ × ٤/١ = ٤/٢ = ٢."
  },
  {
    id: "q1",
    topic: "الأعداد والعمليات",
    difficulty: "medium",
    text: "ما هو ناتج ضرب 0.5 في 1.2؟",
    options: ["0.6", "6.0", "0.06", "1.7"],
    correctAnswer: "0.6",
    explanation: "نضرب الأرقام كأعداد صحيحة (5 × 12 = 60) ثم نضع الفاصلة بعد خانتين عشريتين."
  },
  {
    id: "q2",
    topic: "الجبر",
    difficulty: "easy",
    text: "إذا كانت س + 5 = 12، فما قيمة س؟",
    options: ["7", "17", "5", "12"],
    correctAnswer: "7",
    explanation: "نطرح 5 من الطرفين: س = 12 - 5 = 7."
  },
  {
    id: "q3",
    topic: "الهندسة",
    difficulty: "medium",
    text: "ما هو مجموع زوايا المثلث؟",
    options: ["90°", "180°", "270°", "360°"],
    correctAnswer: "180°",
    explanation: "مجموع قياسات الزوايا الداخلية لأي مثلث يساوي دائماً 180 درجة."
  },
  {
    id: "q4",
    topic: "القياس",
    difficulty: "hard",
    text: "مستطيل طوله 8 سم وعرضه 5 سم، ما هي مساحته؟",
    options: ["13 سم²", "26 سم²", "40 سم²", "80 سم²"],
    correctAnswer: "40 سم²",
    explanation: "مساحة المستطيل = الطول × العرض = 8 × 5 = 40 سم²."
  },
  {
    id: "q5",
    topic: "الإحصاء والاحتمالات",
    difficulty: "medium",
    text: "ما هو المتوسط الحسابي للأعداد: 2، 4، 6؟",
    options: ["3", "4", "5", "6"],
    correctAnswer: "4",
    explanation: "المتوسط الحسابي = مجموع القيم ÷ عددها = (2 + 4 + 6) ÷ 3 = 12 ÷ 3 = 4."
  },
  {
    id: "q6",
    topic: "الأعداد والعمليات",
    difficulty: "easy",
    text: "ما هو ناتج جمع ٤٥٦ + ٢٣٤؟",
    options: ["٦٨٠", "٦٩٠", "٧٠٠", "٦٧٠"],
    correctAnswer: "٦٩٠",
    explanation: "نجمع الآحاد: ٦+٤=١٠ (٠ وباليد ١)، العشرات: ٥+٣+١=٩، المئات: ٤+٢=٦. الناتج ٦٩٠."
  },
  {
    id: "q7",
    topic: "الجبر",
    difficulty: "medium",
    text: "إذا كانت ٢س = ١٠، فما قيمة س؟",
    options: ["٢", "٥", "٨", "١٠"],
    correctAnswer: "٥",
    explanation: "نقسم الطرفين على ٢: س = ١٠ ÷ ٢ = ٥."
  },
  {
    id: "q8",
    topic: "الهندسة",
    difficulty: "hard",
    text: "شكل رباعي جميع أضلاعه متساوية وزواياه قوائم، هو:",
    options: ["المستطيل", "المعين", "المربع", "شبه المنحرف"],
    correctAnswer: "المربع",
    explanation: "المربع هو الشكل الرباعي الذي يتميز بأضلاع متساوية وزوايا قائمة."
  },
  {
    id: "q9",
    topic: "القياس",
    difficulty: "medium",
    text: "كم مليلتر في لتر واحد؟",
    options: ["١٠", "١٠٠", "١٠٠٠", "١٠٠٠٠"],
    correctAnswer: "١٠٠٠",
    explanation: "اللتر الواحد يحتوي على ١٠٠٠ مليلتر."
  },
  {
    id: "q10",
    topic: "الإحصاء والاحتمالات",
    difficulty: "easy",
    text: "عند رمي مكعب أرقام، ما احتمال ظهور الرقم ٥؟",
    options: ["١/٢", "١/٣", "١/٦", "٥/٦"],
    correctAnswer: "١/٦",
    explanation: "المكعب له ٦ أوجه، والرقم ٥ موجود على وجه واحد فقط، لذا الاحتمال هو ١/٦."
  }
];

export const BADGES: Badge[] = [
  { id: "b1", name: "بطل الأرقام", icon: "🔢", description: "أكملت 5 أسئلة في الأعداد" },
  { id: "b2", name: "مهندس المستقبل", icon: "📐", description: "أجبت بشكل صحيح على أسئلة الهندسة" },
  { id: "b3", name: "سريع البديهة", icon: "⚡", description: "أنهيت اختباراً في أقل من دقيقتين" }
];
