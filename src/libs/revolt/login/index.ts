import { client } from "..";

const loginWithEmail = async (
    email: string,
    password: string,
) => {
    try {
        await client.login({
            email,
            password,
        }).catch((e) => {
            throw e;
        })
    } catch (e) {
        console.log(e);
    }
};

// FIXME Revolt.js Doesn't Support MFA Authentication 
const LogintWithMFA = async (email: string, password: string, totp_code: string,) => {
    try {
        await client.login({
            email,
            password
        }).then((e) => {
            console.log(e);
        })
    } catch(e) {
        console.log(e)
    }
}

const loginWithToken = async (token: string) => {
    try {
        await client.loginBot(token).catch((e) => {
            throw e;
        })
    } catch (e) {
        console.log(e);
    }
}

export {loginWithEmail, loginWithToken, LogintWithMFA};