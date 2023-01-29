import {
  Component,
  createSignal,
  Setter,
  Accessor,
  batch,
  onMount,
  Show,
} from "solid-js";
import { revolt as client } from "../../../../lib/revolt";
import { setRevoltUserSession } from "../../../../lib/store/solenoidSessionStore";
import { userSettings } from "../../../../lib/store/solenoidSettingsStore";
import { revoltUserInfo, setRevoltUserInfo } from "../../../../lib/store/solenoidUserStore";

const [token, setToken] = createSignal<string>();
const [email, setEmail] = createSignal<string>();
const [password, setPassword] = createSignal<string>();
const [error, setError] = createSignal<string>();

const Login: Component = () => {
  // Functions
  // Login With Token and Enable Bot Mode
  async function logIntoRevolt(token: string) {
    try {
      await client.login(token, "bot");
    } catch (e: any) {
      if (userSettings.client.developer.debug === true) {
        console.log(e);
        setError(e);
      } else {
        alert(e);
        setError(e);
      }
    } finally {
      setRevoltUserInfo("isLoggedIn", true);
      setRevoltUserSession("token", client.session.token);
      setRevoltUserSession("type", client.session.type);
    }
  }

  // Login With Email and Password and Enable User Mode
  async function loginWithEmail(email: string, password: string) {
    try {
      await client
        .authenticate({
          email: email,
          password: password,
          friendly_name: "Solenoid Client",
        })
        .then(() => {
          setRevoltUserInfo("isLoggedIn", true);
        })
        .catch((e) => {
          throw e;
        })
        .finally(() => {
          batch(() => {  
            setRevoltUserSession("type", client.session.type);
            setRevoltUserSession("token", client.session.token);
          });
        });
    } catch (e: any) {
      if (userSettings.client.developer.debug) {
        console.log(e);
        setError(e);
      } else {
        setError(e);
      }
    }
  }

  return (
    <>
      {!revoltUserInfo.isLoggedIn && (
        <>
          <div class="lg:absolute lg:w-1/3 lg:h-auto flex flex-col h-full w-full shadow-none lg:top-36 lg:left-6 md:sm:bg-base-100 lg:bg-base-300/60 backdrop-blur-xl container rounded-xl shadow-xl">
            <div class="mx-10 my-10 flex items-center gap-2">
              <div class="w-10">
                <img src="/favicon.png" />
              </div>
              <div class="prose">
                <h1>Solenoid</h1>
              </div>
              <div class="prose self-start">
                <Show when={window.location.hostname.includes("localhost")}>
                  <h5>Dev</h5>
                </Show>
              </div>
            </div>
            <form
              class="mx-10"
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
              <div class="sm:w-full">
                <div class="prose m-2">
                  <h3>Login with Email</h3>
                </div>
                <div class="flex flex-col">
                  <input
                    class="input input-bordered w-full my-2"
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email() || ""}
                    onInput={(e: any) => setEmail(e.currentTarget.value)}
                  ></input>
                  <input
                    class="input input-bordered w-full my-2"
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password() || ""}
                    onInput={(e: any) => setPassword(e.currentTarget.value)}
                  ></input>
                  <input
                    class="input w-full my-2"
                    id="mfa"
                    type="text"
                    placeholder="2fa Token (Optional, Not yet implemented)"
                    disabled
                  ></input>
                  <button class="btn w-full my-2" id="submit" type="submit">
                    Login with Email
                  </button>
                </div>

                {error() && (
                  <span class="solenoid-error">
                    An error has occurred while logging in: {error()}
                  </span>
                )}
              </div>
            </form>

            <form
              class="mx-10"
              onSubmit={(e) => {
                e.preventDefault();
                logIntoRevolt(token() ?? "");
              }}
            >
              <div class="flex flex-col">
                <div class="prose m-2">
                  <h3 id="subtitle">Login with Token</h3>
                </div>
                <div class="flex flex-col">
                  <input
                    id="token"
                    type="text"
                    class="input input-bordered w-full my-2"
                    placeholder="Token"
                    value={token() || ""}
                    onInput={(e: any) => setToken(e.currentTarget.value)}
                  ></input>
                  <button class="btn w-full my-2" id="submit" type="submit">
                    Login
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div>
            <div class="hidden lg:block lg:absolute lg:bottom-10 lg:right-10 text-white">
              <p>
                Picture by Sebastian Svenson on{" "}
                <a
                  class="underline text-blue-400"
                  href="https://unsplash.com/photos/D1BZo9JlKjM"
                >
                  Unsplash
                </a>
              </p>
            </div>
            <img
              class="hidden lg:block lg:w-screen lg:h-screen lg:-z-10"
              src="https://images.unsplash.com/photo-1660306630560-0ca0e7f47508?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTZ8fHJlbmRlciUyMG51bGx8ZW58MHx8MHx8&auto=format&fit=crop&w=900&q=60"
            />
          </div>
        </>
      )}
    </>
  );
};

export { Login };
