"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { CheckCircle2, PlayCircle, Star, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background pt-16 md:pt-24 lg:pt-32 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Text Content */}
          <div className="flex flex-col space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="secondary" className="mb-4 text-primary bg-primary/10 hover:bg-primary/20 border-primary/20">
                🚀 #1 AI-Powered IELTS Practice App
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                MASTER IELTS <br />
                <span className="text-primary">WITH AI-POWERED PRACTICE</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-[600px] mb-8">
                Boost your band score with AI-driven insights, instant feedback, and realistic mock tests. Practice Reading, Writing, Speaking, and Listening.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="rounded-full px-8 text-base">
                  Get Started Free
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-8 text-base">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  See Demo
                </Button>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Avatar key={i} className="h-10 w-10 border-2 border-background">
                      <AvatarImage src={`https://i.pravatar.cc/100?img=${i}`} />
                      <AvatarFallback>U{i}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center text-yellow-500">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                  </div>
                  <span>Joined by 10,000+ students</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Floating UI Cards */}
          <div className="relative h-[400px] md:h-[500px] hidden md:block">
            {/* Background glowing blur */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/20 blur-[100px] rounded-full" />
            
            {/* Card 1: Reading */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute top-4 right-12 w-[320px] bg-card border shadow-xl rounded-2xl p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Reading Test</h4>
                  <p className="text-xs text-muted-foreground">Score: 8.0/9.0</p>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[88%]" />
              </div>
            </motion.div>

            {/* Card 2: Writing */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-16 right-4 w-[280px] bg-card border shadow-xl rounded-2xl p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Grammar Check</h4>
                  <p className="text-xs text-emerald-500">No errors found</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full bg-muted rounded-full" />
                <div className="h-2 w-4/5 bg-muted rounded-full" />
              </div>
            </motion.div>

            {/* Card 3: Speaking */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 2 }}
              className="absolute top-1/2 left-0 -translate-y-1/2 w-[260px] bg-card border shadow-xl rounded-2xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="h-4 w-4 bg-primary rounded-full animate-pulse" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">AI Examiner</h4>
                  <p className="text-xs text-muted-foreground">Listening...</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
