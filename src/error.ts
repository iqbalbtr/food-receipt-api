import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { BlankEnv, HTTPResponseError } from "hono/types";
import { ZodError } from "zod"

export default async (err: Error | HTTPResponseError, c: Context<BlankEnv, any, {}>) => {
    
    if (err instanceof HTTPException) {
        return c.json({
            message: err.status === 401 ? "Unauthorized" : err.message
        }, err.status)
    } else if (err instanceof ZodError) {
        console.log(err);
        
        return c.json({
            message: `${err.errors[0].path[0]} field ${err.errors[0].message}`
        }, 400)
    } else {
        return c.json({
            message: "Internal server error"
        }, 500)
    }

}

export const zodValidationError = (err: any, c: Context) => {
    console.log(err);
    
    if (err.error) {
        throw new HTTPException(400, {
            message: `${err.error[0].path[0]} field ${err.error[0].message}`
        });
    }
}
