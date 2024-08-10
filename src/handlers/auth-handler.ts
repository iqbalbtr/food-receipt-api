import { Hono } from "hono";
import { loginValidation, registerValidation } from "@validations/user-validation";
import { loginUser, logout, registerUser } from "@services/auth-service";
import { jwt } from "hono/jwt";
import { HTTPException } from "hono/http-exception";

const GOOGLE_REDIRECT_URI = "http://localhost:3000/auth/google/callback"


const authHandler = new Hono();

authHandler.post("/login", loginValidation, async c => {
    const req = c.req.valid("json");
    const result = await loginUser(req);
    return c.json(result)
})

authHandler.get("/google", async c => {
    const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
    const responseType = 'code';
    const scope = encodeURIComponent('https://www.googleapis.com/auth/userinfo.email');
    const accessType = 'offline'; // For getting a refresh token

    const authUrl = `${GOOGLE_AUTH_ENDPOINT}?response_type=${responseType}&client_id=${encodeURIComponent(process.env.GOOGLE_CLIENT_ID!)}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&scope=${scope}&access_type=${accessType}`;
    return c.redirect(authUrl);
})

authHandler.get('/google/callback', async (c) => {
    const url = new URL(c.req.url);
    const code = url.searchParams.get('code');

    if (!code)
        throw new HTTPException(400, { message: "Authorization code not found" })

    const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

    const tokenResponse = await fetch(GOOGLE_TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            code: code,
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_SECRET_ID!,
            redirect_uri: GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code',
        }),
    });

    const tokenData = await tokenResponse.json();
    console.log(tokenData);
    
    if (tokenData.access_token) {
        /**
         * 
         * Handler auth sesssion to database
         * 
         */
    } else {
        throw new HTTPException(401, { message: "Unauthorized" })
    }

    return c.json(tokenData)
});

authHandler.post("/register", registerValidation, async c => {
    const req = c.req.valid("json");
    const result = await registerUser(req);
    return c.json(result)
})

authHandler.post("/logout",
    jwt({
        secret: process.env.PRIVATE_KEY!
    }),
    async c => {
        const token = c.req.header("Authorization")?.split(" ")[1];
        const user = c.get("jwtPayload");
        await logout(token!, user.id);
        return c.json({
            message: "success"
        })
    })

export default authHandler