import { z } from "zod";
import { procedure, protectedProcedure, router } from "../trpc";

export const userRouter = router({
    me: protectedProcedure.query(({ ctx }) => {
        return ctx.session.user;
    }),
    getUsers: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.user.findMany();
    }),
    createUser: protectedProcedure
        .input(z.object({
            id: z.string(),
            name: z.string(),
            email: z.string(),
            emailVerified: z.boolean(),
            image: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            const { id, name, email, emailVerified, image } = input;
            return await ctx.db.user.create({
                data: {
                    id,
                    name,
                    email,
                    emailVerified,
                    image,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            });
        }),
});
