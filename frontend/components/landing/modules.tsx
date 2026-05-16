// "use client";

// import { motion } from "motion/react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { CheckCircle2, ArrowRight } from "lucide-react";
// import { ReactNode } from "react";

// interface ModuleProps {
//   title: string;
//   badge: string;
//   badgeColor: string;
//   badgeBg: string;
//   description: string;
//   features: string[];
//   ctaText: string;
//   reverse?: boolean;
//   uiMockup: ReactNode;
// }

// function ModuleShowcase({ title, badge, badgeColor, badgeBg, description, features, ctaText, reverse, uiMockup }: ModuleProps) {
//   return (
//     <div className={`flex flex-col gap-12 items-center ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} py-16`}>
//       <motion.div 
//         className="flex-1 space-y-6"
//         initial={{ opacity: 0, x: reverse ? 30 : -30 }}
//         whileInView={{ opacity: 1, x: 0 }}
//         viewport={{ once: true, margin: "-50px" }}
//         transition={{ duration: 0.5 }}
//       >
//         <Badge variant="outline" className={`px-3 py-1 font-semibold border-none ${badgeBg} ${badgeColor}`}>
//           {badge}
//         </Badge>
//         <h3 className="text-3xl font-bold tracking-tight">{title}</h3>
//         <p className="text-lg text-muted-foreground leading-relaxed">
//           {description}
//         </p>
//         <ul className="space-y-4">
//           {features.map((feature, idx) => (
//             <li key={idx} className="flex items-start gap-3">
//               <CheckCircle2 className={`h-5 w-5 mt-0.5 ${badgeColor}`} />
//               <span className="text-foreground font-medium">{feature}</span>
//             </li>
//           ))}
//         </ul>
//         <Button className="mt-4 rounded-full px-8">
//           {ctaText} <ArrowRight className="ml-2 h-4 w-4" />
//         </Button>
//       </motion.div>

//       <motion.div 
//         className="flex-1 w-full"
//         initial={{ opacity: 0, scale: 0.95 }}
//         whileInView={{ opacity: 1, scale: 1 }}
//         viewport={{ once: true, margin: "-50px" }}
//         transition={{ duration: 0.5, delay: 0.2 }}
//       >
//         {uiMockup}
//       </motion.div>
//     </div>
//   );
// }

// export function Modules() {
//   const modules = [
//     {
//       title: "Focused Reading Practice",
//       badge: "READING MODULE",
//       badgeColor: "text-blue-500",
//       badgeBg: "bg-blue-500/10",
//       description: "Tackle real IELTS texts with AI-generated questions. Get instant feedback on your answers and detailed explanations for tricky questions.",
//       features: [
//         "Academic and General Training texts",
//         "Instant scoring and detailed answers",
//         "Highlighting tools and notes feature",
//         "Timed practice to simulate real exams"
//       ],
//       ctaText: "Try Reading Test",
//       reverse: false,
//       uiMockup: (
//         <div className="bg-card border shadow-xl rounded-2xl p-6 w-full max-w-lg mx-auto">
//           <div className="flex items-center justify-between mb-4 border-b pb-4">
//             <h4 className="font-bold">Part 1: The History of Tea</h4>
//             <Badge>09:45</Badge>
//           </div>
//           <div className="flex gap-4">
//             <div className="flex-1 space-y-2">
//               <div className="h-4 w-full bg-muted rounded" />
//               <div className="h-4 w-full bg-muted rounded" />
//               <div className="h-4 w-5/6 bg-muted rounded" />
//               <div className="h-4 w-full bg-muted rounded" />
//             </div>
//             <div className="flex-1 space-y-4 border-l pl-4">
//               <div className="space-y-2">
//                 <p className="text-sm font-semibold">Question 1</p>
//                 <div className="flex items-center gap-2 text-sm"><div className="h-4 w-4 rounded-full border border-primary flex items-center justify-center bg-primary/20" /> True</div>
//                 <div className="flex items-center gap-2 text-sm"><div className="h-4 w-4 rounded-full border" /> False</div>
//                 <div className="flex items-center gap-2 text-sm"><div className="h-4 w-4 rounded-full border" /> Not Given</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )
//     },
//     {
//       title: "Write with Confidence",
//       badge: "WRITING MODULE",
//       badgeColor: "text-emerald-500",
//       badgeBg: "bg-emerald-500/10",
//       description: "Submit your Task 1 and Task 2 essays for immediate grading. Our AI analyzes your writing against official IELTS criteria.",
//       features: [
//         "Full scoring on all 4 band descriptors",
//         "Line-by-line grammar corrections",
//         "Vocabulary upgrade suggestions",
//         "Model answers for every prompt"
//       ],
//       ctaText: "Try Writing Test",
//       reverse: true,
//       uiMockup: (
//         <div className="bg-card border shadow-xl rounded-2xl p-6 w-full max-w-lg mx-auto flex flex-col gap-4">
//           <div className="flex items-center justify-between border-b pb-2">
//             <h4 className="font-bold text-sm">Task 2 Essay</h4>
//             <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10">Band 7.5</Badge>
//           </div>
//           <div className="p-3 bg-muted/30 rounded-lg text-sm text-muted-foreground">
//             Some people believe that unpaid community service should be a compulsory part of high school programmes...
//           </div>
//           <div className="relative">
//             <div className="min-h-[150px] p-3 border rounded-lg text-sm bg-background">
//               I firmly believe that implementing <span className="text-red-500 line-through">mandatory</span> <span className="text-emerald-500 font-semibold">compulsory</span> community service in high schools yields numerous benefits...
//             </div>
//           </div>
//         </div>
//       )
//     },
//     {
//       title: "Speak with an AI Examiner",
//       badge: "SPEAKING MODULE",
//       badgeColor: "text-purple-500",
//       badgeBg: "bg-purple-500/10",
//       description: "Have a real-time conversation with our AI examiner. Practice all three parts of the speaking test in a stress-free environment.",
//       features: [
//         "Interactive voice conversations",
//         "Instant fluency and pronunciation analysis",
//         "Transcripts of your answers",
//         "Ideas and vocabulary suggestions"
//       ],
//       ctaText: "Try Speaking Test",
//       reverse: false,
//       uiMockup: (
//         <div className="bg-card border shadow-xl rounded-2xl p-6 w-full max-w-lg mx-auto">
//           <div className="flex flex-col gap-4">
//             <div className="flex gap-3 items-end">
//               <div className="h-8 w-8 rounded-full bg-purple-500/20 flex-shrink-0" />
//               <div className="bg-muted p-3 rounded-2xl rounded-bl-none text-sm max-w-[80%]">
//                 Let's move on to Part 2. Describe a time you visited a new place.
//               </div>
//             </div>
//             <div className="flex gap-3 items-end flex-row-reverse">
//               <div className="h-8 w-8 rounded-full bg-primary/20 flex-shrink-0" />
//               <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-br-none text-sm max-w-[80%]">
//                 I would like to talk about a trip to Kyoto I took last year...
//               </div>
//             </div>
//             <div className="flex justify-center mt-4">
//               <div className="h-12 w-12 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg animate-pulse cursor-pointer">
//                 <div className="h-4 w-4 bg-white rounded-sm" />
//               </div>
//             </div>
//           </div>
//         </div>
//       )
//     },
//     {
//       title: "Train Your Listening Skills",
//       badge: "LISTENING MODULE",
//       badgeColor: "text-blue-400",
//       badgeBg: "bg-blue-400/10",
//       description: "Listen to various accents in realistic exam scenarios. Our platform simulates the exact audio timing of the real test.",
//       features: [
//         "British, Australian, and North American accents",
//         "Map labeling, matching, and MCQs",
//         "Review mode with audio transcripts",
//         "Adjustable playback speeds"
//       ],
//       ctaText: "Try Listening Test",
//       reverse: true,
//       uiMockup: (
//         <div className="bg-card border shadow-xl rounded-2xl p-6 w-full max-w-lg mx-auto">
//           <div className="flex items-center gap-4 mb-6 bg-muted/50 p-4 rounded-xl">
//             <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 cursor-pointer">
//                <div className="w-0 h-0 border-t-4 border-t-transparent border-l-6 border-l-white border-b-4 border-b-transparent ml-1" />
//             </div>
//             <div className="flex-1 space-y-2">
//               <div className="flex justify-between text-xs text-muted-foreground">
//                 <span>01:24</span>
//                 <span>04:30</span>
//               </div>
//               <div className="h-2 bg-border rounded-full overflow-hidden">
//                 <div className="h-full bg-primary w-1/3" />
//               </div>
//             </div>
//           </div>
//           <div className="space-y-4">
//             <h4 className="font-semibold text-sm">Fill in the blanks:</h4>
//             <div className="text-sm">
//               The library is located next to the <span className="inline-block border-b-2 border-primary w-24 text-center text-primary font-medium">cafeteria</span> on the first floor.
//             </div>
//             <div className="text-sm">
//               Students can borrow up to <span className="inline-block border-b border-border w-16" /> books at a time.
//             </div>
//           </div>
//         </div>
//       )
//     }
//   ];

//   return (
//     <section className="py-20 bg-muted/10">
//       <div className="container mx-auto px-4 md:px-6">
//         <div className="text-center mb-8 space-y-4">
//           <Badge variant="outline" className="px-3 py-1 uppercase tracking-wider text-xs font-semibold text-primary border-primary/20">
//             Modules
//           </Badge>
//           <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Explore Each Test Module</h2>
//           <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
//             Master every section of the exam with specialized tools and instant AI feedback.
//           </p>
//         </div>
        
//         <div className="flex flex-col gap-8 md:gap-16">
//           {modules.map((module, idx) => (
//             <ModuleShowcase key={idx} {...module} />
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }



"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { ReactNode } from "react";

interface ModuleProps {
  title: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  description: string;
  features: string[];
  ctaText: string;
  reverse?: boolean;
  uiMockup: ReactNode;
  href?: string;
}

function ModuleShowcase({ title, badge, badgeColor, badgeBg, description, features, ctaText, reverse, uiMockup, href }: ModuleProps) {
  const router = useRouter();

  return (
    <div className={`flex flex-col gap-12 items-center ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} py-16`}>
      <motion.div 
        className="flex-1 space-y-6"
        initial={{ opacity: 0, x: reverse ? 30 : -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
      >
        <Badge variant="outline" className={`px-3 py-1 font-semibold border-none ${badgeBg} ${badgeColor}`}>
          {badge}
        </Badge>
        <h3 className="text-3xl font-bold tracking-tight">{title}</h3>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>
        <ul className="space-y-4">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <CheckCircle2 className={`h-5 w-5 mt-0.5 ${badgeColor}`} />
              <span className="text-foreground font-medium">{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          className="mt-4 rounded-full px-8"
          onClick={() => href && router.push(href)}
          disabled={!href}
        >
          {ctaText} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>

      <motion.div 
        className="flex-1 w-full"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {uiMockup}
      </motion.div>
    </div>
  );
}

export function Modules() {
  const modules = [
    {
      title: "Focused Reading Practice",
      badge: "READING MODULE",
      badgeColor: "text-blue-500",
      badgeBg: "bg-blue-500/10",
      description: "Tackle real IELTS texts with AI-generated questions. Get instant feedback on your answers and detailed explanations for tricky questions.",
      features: [
        "Academic and General Training texts",
        "Instant scoring and detailed answers",
        "Highlighting tools and notes feature",
        "Timed practice to simulate real exams"
      ],
      ctaText: "Try Reading Test",
      reverse: false,
      uiMockup: (
        <div className="bg-card border shadow-xl rounded-2xl p-6 w-full max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4 border-b pb-4">
            <h4 className="font-bold">Part 1: The History of Tea</h4>
            <Badge>09:45</Badge>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-5/6 bg-muted rounded" />
              <div className="h-4 w-full bg-muted rounded" />
            </div>
            <div className="flex-1 space-y-4 border-l pl-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold">Question 1</p>
                <div className="flex items-center gap-2 text-sm"><div className="h-4 w-4 rounded-full border border-primary flex items-center justify-center bg-primary/20" /> True</div>
                <div className="flex items-center gap-2 text-sm"><div className="h-4 w-4 rounded-full border" /> False</div>
                <div className="flex items-center gap-2 text-sm"><div className="h-4 w-4 rounded-full border" /> Not Given</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Write with Confidence",
      badge: "WRITING MODULE",
      badgeColor: "text-emerald-500",
      badgeBg: "bg-emerald-500/10",
      description: "Submit your Task 1 and Task 2 essays for immediate grading. Our AI analyzes your writing against official IELTS criteria.",
      features: [
        "Full scoring on all 4 band descriptors",
        "Line-by-line grammar corrections",
        "Vocabulary upgrade suggestions",
        "Model answers for every prompt"
      ],
      ctaText: "Try Writing Test",
      href: "/writing",
      reverse: true,
      uiMockup: (
        <div className="bg-card border shadow-xl rounded-2xl p-6 w-full max-w-lg mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-bold text-sm">Task 2 Essay</h4>
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10">Band 7.5</Badge>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-sm text-muted-foreground">
            Some people believe that unpaid community service should be a compulsory part of high school programmes...
          </div>
          <div className="relative">
            <div className="min-h-[150px] p-3 border rounded-lg text-sm bg-background">
              I firmly believe that implementing <span className="text-red-500 line-through">mandatory</span> <span className="text-emerald-500 font-semibold">compulsory</span> community service in high schools yields numerous benefits...
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Speak with an AI Examiner",
      badge: "SPEAKING MODULE",
      badgeColor: "text-purple-500",
      badgeBg: "bg-purple-500/10",
      description: "Have a real-time conversation with our AI examiner. Practice all three parts of the speaking test in a stress-free environment.",
      features: [
        "Interactive voice conversations",
        "Instant fluency and pronunciation analysis",
        "Transcripts of your answers",
        "Ideas and vocabulary suggestions"
      ],
      ctaText: "Try Speaking Test",
      reverse: false,
      uiMockup: (
        <div className="bg-card border shadow-xl rounded-2xl p-6 w-full max-w-lg mx-auto">
          <div className="flex flex-col gap-4">
            <div className="flex gap-3 items-end">
              <div className="h-8 w-8 rounded-full bg-purple-500/20 flex-shrink-0" />
              <div className="bg-muted p-3 rounded-2xl rounded-bl-none text-sm max-w-[80%]">
                Let's move on to Part 2. Describe a time you visited a new place.
              </div>
            </div>
            <div className="flex gap-3 items-end flex-row-reverse">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex-shrink-0" />
              <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-br-none text-sm max-w-[80%]">
                I would like to talk about a trip to Kyoto I took last year...
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <div className="h-12 w-12 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg animate-pulse cursor-pointer">
                <div className="h-4 w-4 bg-white rounded-sm" />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Train Your Listening Skills",
      badge: "LISTENING MODULE",
      badgeColor: "text-blue-400",
      badgeBg: "bg-blue-400/10",
      description: "Listen to various accents in realistic exam scenarios. Our platform simulates the exact audio timing of the real test.",
      features: [
        "British, Australian, and North American accents",
        "Map labeling, matching, and MCQs",
        "Review mode with audio transcripts",
        "Adjustable playback speeds"
      ],
      ctaText: "Try Listening Test",
      reverse: true,
      uiMockup: (
        <div className="bg-card border shadow-xl rounded-2xl p-6 w-full max-w-lg mx-auto">
          <div className="flex items-center gap-4 mb-6 bg-muted/50 p-4 rounded-xl">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 cursor-pointer">
               <div className="w-0 h-0 border-t-4 border-t-transparent border-l-6 border-l-white border-b-4 border-b-transparent ml-1" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>01:24</span>
                <span>04:30</span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-primary w-1/3" />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Fill in the blanks:</h4>
            <div className="text-sm">
              The library is located next to the <span className="inline-block border-b-2 border-primary w-24 text-center text-primary font-medium">cafeteria</span> on the first floor.
            </div>
            <div className="text-sm">
              Students can borrow up to <span className="inline-block border-b border-border w-16" /> books at a time.
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="py-20 bg-muted/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-8 space-y-4">
          <Badge variant="outline" className="px-3 py-1 uppercase tracking-wider text-xs font-semibold text-primary border-primary/20">
            Modules
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Explore Each Test Module</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Master every section of the exam with specialized tools and instant AI feedback.
          </p>
        </div>
        
        <div className="flex flex-col gap-8 md:gap-16">
          {modules.map((module, idx) => (
            <ModuleShowcase key={idx} {...module} />
          ))}
        </div>
      </div>
    </section>
  );
}
