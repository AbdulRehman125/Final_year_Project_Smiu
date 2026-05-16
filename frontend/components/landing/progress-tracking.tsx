"use client";

import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";

export function ProgressTracking() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Badge variant="outline" className="px-3 py-1 uppercase tracking-wider text-xs font-semibold text-emerald-500 border-emerald-500/20 bg-emerald-500/10">
              Analytics
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">Track Your Progress Like a Pro</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our advanced analytics dashboard breaks down your performance by module, question type, and skill set. See exactly what you need to focus on to reach your target score faster.
            </p>
            
            <div className="grid grid-cols-2 gap-6 pt-6 border-t mt-8">
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Target Band</p>
                <p className="text-2xl font-bold text-foreground">7.5</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Current Estimate</p>
                <p className="text-2xl font-bold text-emerald-500">7.0</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Tests Completed</p>
                <p className="text-2xl font-bold text-foreground">14</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Weakest Module</p>
                <p className="text-2xl font-bold text-orange-500">Writing</p>
              </div>
            </div>
          </motion.div>

          {/* Right UI Chart Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-card border shadow-2xl rounded-2xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold">Overall Progress</h3>
                <Badge variant="secondary">Last 30 Days</Badge>
              </div>
              
              <div className="flex gap-4 items-end h-48 mt-4 border-b pb-4 relative">
                {/* Horizontal Guide lines */}
                <div className="absolute w-full h-[1px] bg-border/50 bottom-[20%]" />
                <div className="absolute w-full h-[1px] bg-border/50 bottom-[50%]" />
                <div className="absolute w-full h-[1px] bg-border/50 bottom-[80%]" />
                
                {/* Chart Bars */}
                {[4, 5, 5.5, 6, 6, 6.5, 6.5, 7, 7, 7.5, 7.5].map((height, i) => (
                  <motion.div 
                    key={i} 
                    className="flex-1 bg-primary/20 hover:bg-primary transition-colors rounded-t-sm relative z-10"
                    style={{ height: `${(height / 9) * 100}%` }}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${(height / 9) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.05 }}
                  >
                    {/* The last bar is highlighted */}
                    {i === 10 && <div className="absolute top-0 left-0 w-full h-full bg-primary rounded-t-sm" />}
                  </motion.div>
                ))}
              </div>
              
              <div className="flex justify-between mt-4 text-xs text-muted-foreground font-medium">
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
