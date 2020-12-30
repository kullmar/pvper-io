import { AccessToken } from "simple-oauth2";

namespace NodeJS {
    interface Global {
        bnetAccessToken: AccessToken | Promise<AccessToken>
    }
}
