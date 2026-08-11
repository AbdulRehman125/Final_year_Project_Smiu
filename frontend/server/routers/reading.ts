// frontend/server/routers/reading.ts — tRPC router for IELTS Reading module DB operations

import { z } from "zod";
import { router, procedure, protectedProcedure } from "../trpc";

export const readingRouter = router({
  // Get an existing test from DB or return null to trigger AI generation
  getTest: procedure.query(async ({ ctx }) => {
    const count = await ctx.db.readingTest.count();
    if (count === 0) return null;

    // Pick a random test from DB if available
    const skip = Math.floor(Math.random() * count);
    const tests = await ctx.db.readingTest.findMany({
      skip,
      take: 1,
    });

    return tests[0] || null;
  }),

  // Save an AI-generated test to DB for caching & reuse
  saveTest: procedure
    .input(
      z.object({
        title: z.string(),
        difficulty: z.string().default("mixed"),
        passages: z.any(),
        questions: z.any(),
        topics: z.array(z.string()),
        totalQuestions: z.number().default(40),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const test = await ctx.db.readingTest.create({
        data: {
          title: input.title,
          difficulty: input.difficulty,
          passages: input.passages,
          questions: input.questions,
          topics: input.topics,
          totalQuestions: input.totalQuestions,
        },
      });
      return test;
    }),

  // Save a completed test attempt
  submitAttempt: procedure
    .input(
      z.object({
        testId: z.string(),
        answers: z.any(),
        score: z.number(),
        bandScore: z.number(),
        accuracy: z.number(),
        timeTakenSeconds: z.number(),
        passageScores: z.any(),
        questionTypeScores: z.any(),
        recommendations: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id || null;

      const attempt = await ctx.db.readingAttempt.create({
        data: {
          userId,
          testId: input.testId,
          answers: input.answers,
          score: input.score,
          bandScore: input.bandScore,
          accuracy: input.accuracy,
          timeTakenSeconds: input.timeTakenSeconds,
          passageScores: input.passageScores,
          questionTypeScores: input.questionTypeScores,
          recommendations: input.recommendations,
          completedAt: new Date(),
        },
      });
      return attempt;
    }),

  // Get user's past attempts (requires auth)
  getAttempts: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.readingAttempt.findMany({
      where: { userId: ctx.session.user.id },
      include: { test: true },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Get single attempt details
  getAttempt: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.readingAttempt.findUnique({
        where: { id: input.id },
        include: { test: true },
      });
    }),
});
