import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const eventRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                title: z.string().min(2).max(20),
                description: z.string().min(5),
                date: z.date(),
                contactIds: z.string().array()
            })
        ).mutation(
            async ({ input, ctx }) => {
                try {
                    const attendeesToCreate = input.contactIds.map(id => ({ contactId: id }));
                    const record = await ctx.prisma.event.create({
                        data: {
                            userId: ctx.session.user.id,
                            title: input.title,
                            description: input.description,
                            date: input.date,
                            attendees: {
                                create: [...attendeesToCreate]
                            }
                        }
                    })
                    return record;
                } catch (err) {
                    if (err instanceof Prisma.PrismaClientKnownRequestError) {
                        if (err.code === 'P2002') throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: err.message,
                        });
                    }
                }
            }
        ),

    getAllIncludingAttendeesCount: protectedProcedure
        .query(
            async ({ ctx }) => ctx.prisma.event.findMany({
                where: { userId: ctx.session.user.id },
                include: {
                    _count: {
                        select: {
                            attendees: true
                        }
                    }
                }
            })
        ),

    getByIdIncludingAttendees: protectedProcedure
        .input(z.string())
        .query(
            async ({ input, ctx }) => {
                try {
                    const record = await ctx.prisma.event.findUniqueOrThrow({
                        where: { id: input },
                        include: {
                            attendees: {
                                include: {
                                    contact: true
                                }
                            },
                        }
                    })
                    return record;
                } catch (err) {
                    if (err instanceof Prisma.PrismaClientKnownRequestError) {
                        if (err.code === 'P2025') throw new TRPCError({
                            code: 'NOT_FOUND',
                            message: err.message,
                        });
                    }
                }
            }
        ),

    removeById: protectedProcedure
        .input(z.string())
        .mutation(
            async ({ input, ctx }) => ctx.prisma.event.deleteMany({
                where: {
                    id: input,
                    userId: ctx.session.user.id
                }
            })
        ),
});