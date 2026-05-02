"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PenTool, Mic, BookOpen, BarChart3 } from "lucide-react";

export function Features() {
  const features = [
    {
      title: "Real-time Grammar Correction",
      description: "Write your essays and get instant feedback on grammar, vocabulary, and cohesion. Learn from your mistakes instantly.",
      icon: PenTool,
      badge: "AI Writing",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Instant Speaking Feedback",
      description: "Practice speaking with our AI examiner. Get evaluated on fluency, lexical resource, and pronunciation in real-time.",
      icon: Mic,
      badge: "AI Speaking",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Vocabulary Enhancement",
      description: "Discover advanced vocabulary alternatives tailored to your writing style and target band score.",
      icon: BookOpen,
      badge: "Smart Suggestions",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Detailed Performance Metrics",
      description: "Track your progress across all four modules with visual analytics and actionable insights to focus your study.",
      icon: BarChart3,
      badge: "Analytics",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 space-y-4">
          <Badge variant="outline" className="px-3 py-1 uppercase tracking-wider text-xs font-semibold text-primary border-primary/20">
            Features
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Everything You Need to Ace IELTS</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Our comprehensive suite of AI tools covers all aspects of the IELTS exam to ensure you're fully prepared.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full border border-border/50 shadow-sm transition-all hover:shadow-md dark:bg-card">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className={`p-3 rounded-xl ${feature.bg} ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <Badge variant="secondary" className="mb-2 text-xs font-medium">
                      {feature.badge}
                    </Badge>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
