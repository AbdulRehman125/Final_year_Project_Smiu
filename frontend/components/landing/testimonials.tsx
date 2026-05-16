"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Parker",
      location: "Academic, Target 7.0",
      band: "8.0",
      text: "The speaking evaluation felt exactly like the real test. The AI caught my pronunciation errors that my human tutor missed. I improved from a 6.5 to an 8.0 in just a month!",
      avatar: "https://i.pravatar.cc/150?img=47",
    },
    {
      name: "David Chen",
      location: "General, Target 7.0",
      band: "7.5",
      text: "The Writing Task 2 feedback was incredible. It didn't just correct my grammar, but also suggested better vocabulary and improved my paragraph structure. Highly recommended.",
      avatar: "https://i.pravatar.cc/150?img=11",
    },
    {
      name: "Aisha Ali",
      location: "Academic, Target 6.5",
      band: "7.0",
      text: "I was struggling with Reading time management. The platform's timed mock tests and instant explanations for tricky True/False/Not Given questions were exactly what I needed.",
      avatar: "https://i.pravatar.cc/150?img=9",
    },
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 space-y-4">
          <Badge variant="outline" className="px-3 py-1 uppercase tracking-wider text-xs font-semibold text-yellow-600 border-yellow-600/20 bg-yellow-600/10">
            Reviews
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">What Students Are Saying</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full border-border/50 shadow-sm hover:shadow-md transition-shadow dark:bg-card">
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="flex gap-1 mb-4 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground leading-relaxed flex-grow italic mb-6">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={testimonial.avatar} />
                        <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-none font-bold">
                      Band {testimonial.band}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
