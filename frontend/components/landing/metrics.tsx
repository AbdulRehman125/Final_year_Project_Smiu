"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, TrendingUp, CheckCircle } from "lucide-react";

export function Metrics() {
  const stats = [
    { value: "12,000+", label: "Active Students", icon: Users, color: "text-blue-500" },
    { value: "98%", label: "Success Rate", icon: Target, color: "text-emerald-500" },
    { value: "+1.5", label: "Avg. Band Improvement", icon: TrendingUp, color: "text-orange-500" },
    { value: "500k+", label: "Questions Answered", icon: CheckCircle, color: "text-primary" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="border-none shadow-md dark:bg-card">
                <CardContent className="p-6 py-4 flex flex-col items-center text-center space-y-2">
                  <div className={`p-3 rounded-full bg-muted/50 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold tracking-tight mb-1">{stat.value}</h3>
                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
