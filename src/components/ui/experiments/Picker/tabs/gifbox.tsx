import type { Accessor, Component, Setter } from "solid-js";
import { createSignal, createEffect, For } from "solid-js";
import { gbClient } from "../../../../../lib/gifbox";

const [loading, setLoading] = createSignal<boolean>(true);
const [error, setError] = createSignal<string>("");
const [email, setEmail] = createSignal<string>("");
const [password, setPassword] = createSignal<string>("");
const [loggedIn, setLoggedIn] = createSignal<boolean>(false);
const [gifs, setGifs] = createSignal<any[]>();
const [query, setQuery] = createSignal<string>("");

interface props {
    message: Accessor<string>
    setMessage: Setter<string>
    tab: Accessor<number>
}

async function requestPopularGifs() {
    try {
      setLoading(true);
      const gifArray = await gbClient.post.popularPosts(50, 0).catch((e) => {
        throw e;
      });
      if (gifArray) return gifArray;
    } catch (e) {
      setError(e as string);
    } finally {
      setLoading(false);
    }
  }

  async function loginToGifbox() {
    try {
      if (email() && password()) {
        gbClient
          .createSession(email() as any, password() as any, "Solenoid Client")
          .catch((e) => {
            throw e;
          });
      } else {
        throw "You need to provide an Email/Password :/";
      }
    } catch (e) {
      setError(e as string);
    } finally {
      setLoggedIn(true);
    }
  }

  async function searchGB() {
    try {
      await gbClient.post
        .searchPosts(query(), 100, 0)
        .then((e) => {
          setGifs(e.hits);
        })
        .catch((e) => {
          throw e;
        });
    } catch (e) {
      setError(e as string);
    } 
  }

export const GifTab: Component<props> = (props) => {

    function addToText(s: string) {
        props.setMessage(props.message() + s);
    }

    createEffect(async () => {
        if (props.tab() === 1 && loggedIn()) {
          await requestPopularGifs().then((e) => {
            setGifs(e as any);
          });
        }
      }, [props.tab()]);
    
    return (
        <>
          {loggedIn() ? (
            <div class="solenoid-picker-grid gifbox">
              <div>
                <input
                  role="searchbox"
                  placeholder="Browse GIFBox"
                  value={query()}
                  onChange={(e) => setQuery(e.currentTarget.value)}
                />
                <button onClick={searchGB}>Search</button>
              </div>
              {loading() ? (
                <div class="loading">
                  <span>Loading Gifs... 📦</span>
                </div>
              ) : (
                <For each={gifs()}>
                  {(gif) => {
                    console.log(gif);
                    return (
                      <div
                        class="gif-container"
                        onClick={() =>
                          addToText(
                            `[](https://api.gifbox.me/file/posts/${gif.file.fileName})`
                          )
                        }
                      >
                        <img
                          class="gif"
                          src={`https://api.gifbox.me/file/posts/${gif.file.fileName}`}
                        />
                      </div>
                    );
                  }}
                </For>
              )}
              {gifs()!.length < 0 && <p>{error()}</p>}
            </div>
          ) : (
            <div class="solenoid-gifbox-login">
              <span class="needs-login-gifbox">
                You need to log into GIFBox before using this feature...
              </span>
              <input
                value={email() ?? ""}
                onChange={(e) => setEmail(e.currentTarget.value)}
                placeholder="Gifbox Email"
                type="email"
              />
              <input
                value={password() ?? ""}
                onChange={(e) => setPassword(e.currentTarget.value)}
                placeholder="Password"
                type="password"
              />
              <button onClick={loginToGifbox}>Login</button>
            </div>
          )}
        </>
    )
}

export default GifTab;