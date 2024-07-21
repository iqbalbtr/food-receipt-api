import { Hono } from "hono";
import { loginValidation, registerValidation } from "@validations/user-validation";
import { loginUser, registerUser } from "@services/auth-service";

const authHandler = new Hono();

authHandler.post("/login", loginValidation, async c => {
    const req = c.req.valid("form");
    const result = await loginUser(req);
    return c.json({
        token: result.token
    })
})

authHandler.post("/register", registerValidation, async c => {
    const req = c.req.valid("form");
    const result = await registerUser(req);
    return c.json(result)
})

export default authHandler