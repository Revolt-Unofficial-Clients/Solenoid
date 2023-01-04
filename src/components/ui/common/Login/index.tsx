import {
  Component,
  createSignal,
  Setter,
  Accessor,
  batch,
  onMount,
} from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import type { user, settings } from "../../../../types";
import type { Client } from "revolt.js";

interface LoginComponent {
  client: Client;
  userSetter: SetStoreFunction<user>;
  logSetter: Setter<boolean>;
  logged: Accessor<boolean>;
  configSetter: SetStoreFunction<settings>;
  solenoid_config: settings;
}
const [token, setToken] = createSignal<string>();
const [email, setEmail] = createSignal<string>();
const [password, setPassword] = createSignal<string>();
const [error, setError] = createSignal<string>();

const Login: Component<LoginComponent> = ({
  client,
  userSetter,
  configSetter,
  solenoid_config,
  logSetter,
  logged,
}) => {
  // Functions
  // Login With Token and Enable Bot Mode
  async function logIntoRevolt(token: string) {
    try {
      await client.loginBot(token);
    } catch (e: any) {
      if (solenoid_config.debug === true) {
        console.log(e);
        setError(e);
      } else {
        alert(e);
        setError(e);
      }
    } finally {
      logSetter(true);
      userSetter("session_type", "token");
      configSetter("session", client.session);
    }
  }

  // Login With Email and Password and Enable User Mode
  async function loginWithEmail(email: string, password: string) {
    try {
      await client
        .login({
          email: email,
          password: password,
          friendly_name: "Solenoid Client Beta",
        })
        .catch((e) => {
          throw e;
        })
        .finally(() => {
          batch(() => {
            logSetter(true);
            userSetter("session_type", "email");
            configSetter("session", client.session);
          });
        });
    } catch (e: any) {
      if (solenoid_config.debug) {
        console.log(e);
        setError(e);
      } else {
        setError(e);
      }
    }
  }
  async function loginWithSession(session: any & { action: "LOGIN" }) {
    try {
      await client.useExistingSession(session).catch((e) => {
        throw e;
      });
      batch(() => {
        configSetter("session_type", "email");
        configSetter("session", session);
        logSetter(true);
      });
    } catch (e: any) {
      setError(e);
    }
  }

  onMount(() => {
    if (solenoid_config.session) {
      loginWithSession(solenoid_config.session);
    }
  });

  return (
    <>
      {!logged() && (
        <div class="solenoid-login">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              logIntoRevolt(token() ?? "");
            }}
          >
            <div class="token">
              <label id="subtitle">Login with Token</label>
              <input
                id="token"
                type="text"
                class="textarea"
                placeholder="Token"
                value={token() || ""}
                onInput={(e: any) => setToken(e.currentTarget.value)}
              ></input>
              <button id="submit" type="submit">
                Login
              </button>
            </div>
          </form>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (email() && password()) {
                  try {
                    await loginWithEmail(email() ?? "", password() ?? "").catch(
                      (e) => {
                        throw e;
                      }
                    );
                  } catch (e) {
                    console.error(e);
                  }
                }
              }}
            >
              <div>
                <label id="subtitle">Login with Email</label>
                <input
                  class="textarea"
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email() || ""}
                  onInput={(e: any) => setEmail(e.currentTarget.value)}
                ></input>
                <input
                  class="textarea"
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password() || ""}
                  onInput={(e: any) => setPassword(e.currentTarget.value)}
                ></input>
                <input
                  class="textarea"
                  id="mfa"
                  type="text"
                  placeholder="2fa Token (Optional, Not yet implemented)"
                  disabled
                ></input>
                <button id="submit" type="submit">
                  Login
                </button>
                {error() && (
                  <span class="solenoid-error">
                    An error has occurred while logging in: {error()}
                  </span>
                )}
              </div>
            </form>
          {solenoid_config.session && (
            <button
              id="existingsession"
              onClick={() => loginWithSession(solenoid_config.session)}
            >
              Use Existing Session
            </button>
          )}
        </div>
      )}
    </>
  );
};

export { Login };
