"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-24 bg-background px-4 md:px-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-blue-50 dark:bg-slate-900 border border-blue-100 dark:border-slate-800 p-8 md:p-16 lg:p-24 text-center"
        >
          {/* Background Decorative Elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] translate-x-1/2 translate-y-1/2" />
          
          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-6 rotate-3">
              <span className="font-bold text-2xl">AI</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Start Your IELTS Journey Today
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground">
              Join thousands of students who have achieved their target band score with our AI-powered mock tests and instant feedback.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Button size="lg" className="rounded-full px-8 text-base shadow-lg shadow-primary/20">
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 text-base bg-background/50 backdrop-blur">
                Log In
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
