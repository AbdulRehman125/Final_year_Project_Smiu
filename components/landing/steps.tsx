"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Steps() {
  const steps = [
    {
      number: "01",
      title: "Take a Mock Test",
      description: "Complete a full or module-specific IELTS mock test under realistic exam conditions.",
    },
    {
      number: "02",
      title: "Get Instant Feedback",
      description: "Receive comprehensive AI evaluation, including band scores and detailed corrections instantly.",
    },
    {
      number: "03",
      title: "Improve Your Weaknesses",
      description: "Practice targeted exercises based on your performance to boost your score efficiently.",
    },
  ];

  return (
    <section className="py-24 bg-background overflow-hidden relative">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <Badge variant="outline" className="px-3 py-1 uppercase tracking-wider text-xs font-semibold text-orange-500 border-orange-500/20 bg-orange-500/10">
            How It Works
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Three Steps to Your Target Score</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting Line (Desktop only) */}
          <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-border -translate-y-1/2 z-0" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative z-10"
            >
              <Card className="border-none shadow-lg dark:bg-card/90 backdrop-blur text-center h-full hover:shadow-xl transition-all">
                <CardContent className="pt-8 pb-8 px-6 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative">
                    <span className="text-3xl font-black text-primary/20 absolute -top-4 -right-4">{step.number}</span>
                    <span className="text-xl font-bold text-primary">{step.number}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
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
