import { router } from "./trpc";
import { userRouter } from "./routers/user";
import { readingRouter } from "./routers/reading";
import { listeningRouter } from "./routers/listening";

export const appRouter = router({
    user: userRouter,
    reading: readingRouter,
    listening: listeningRouter,
});

export type AppRouter = typeof appRouter;