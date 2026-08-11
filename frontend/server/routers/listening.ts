import { z } from "zod";
import { router, procedure, protectedProcedure } from "../trpc";

export const listeningRouter = router({
  getTest: procedure.query(async ({ ctx }) => {
    const count = await ctx.db.listeningTest.count();
    if (count === 0) return null;
    const skip = Math.floor(Math.random() * count);
    const tests = await ctx.db.listeningTest.findMany({ skip, take: 1 });
    return tests[0] || null;
  }),

  saveTest: procedure
    .input(z.object({
      title: z.string(),
      difficulty: z.string().default("mixed"),
      sections: z.any(),
      questions: z.any(),
      audioUrls: z.any(),
      transcripts: z.any(),
      topics: z.array(z.string()),
      totalQuestions: z.number().default(40),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.listeningTest.create({ data: input });
    }),

  submitAttempt: procedure
    .input(z.object({
      testId: z.string(),
      answers: z.any(),
      score: z.number(),
      bandScore: z.number(),
      accuracy: z.number(),
      timeTakenSeconds: z.number(),
      sectionScores: z.any(),
      questionTypeScores: z.any(),
      recommendations: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id || null;
      return ctx.db.listeningAttempt.create({
        data: { ...input, userId, completedAt: new Date() },
      });
    }),

  getAttempts: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.listeningAttempt.findMany({
      where: { userId: ctx.session.user.id },
      include: { test: true },
      orderBy: { createdAt: "desc" },
    });
  }),

  getAttempt: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.listeningAttempt.findUnique({
        where: { id: input.id },
        include: { test: true },
      });
    }),
});
