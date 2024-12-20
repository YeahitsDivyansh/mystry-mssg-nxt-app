import { z } from 'zod'

export const signInSchema = z.object({
    identifier: z.string(),//can be anything either email or username
    password: z.string(),
});
