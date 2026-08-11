import { router } from "./trpc";
import { userRouter } from "./routers/user";
import { readingRouter } from "./routers/reading";

export const appRouter = router({
    user: userRouter,
    reading: readingRouter,
});

export type AppRouter = typeof appRouter;