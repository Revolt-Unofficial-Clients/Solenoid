import type { Component, Setter, Accessor } from "solid-js"
import { For, createSignal, createEffect } from "solid-js"
import {emojiDictionary} from "../../assets/emoji";
import { Message } from "revolt.js"
import { Client } from "gifbox.js";
// import type { settings } from "../../types";
import { Responses } from "gifbox.js";
const gbClient = new Client({
    baseURL: "https://api.gifbox.me/"
});

interface props {
    setMessage?: Setter<string> | any;
    message?: Accessor<string> | any;
    type: string;
    messageToReact?: Message;
    setOpen: Setter<boolean>;
}

const [tab, setTab] = createSignal<number>(0);
const [loggedIn, setLoggedIn] = createSignal<boolean>(false);
const [email, setEmail] = createSignal<string | null>("");
const [password, setPassword] = createSignal<string | null>("");
const [gifs, setGifs] = createSignal<any[]>();
const [query, setQuery] = createSignal<string>("");
const [error, setError] = createSignal<string | null>();
const [loading, setLoading] = createSignal<boolean>(true);

export const Picker: Component<props> = (props) => {
    async function requestPopularGifs() {
        try {
            setLoading(true);
            const gifArray = await gbClient.post.popularPosts(50, 0).catch((e) => {
                throw e;
            });
            if(gifArray) return gifArray;
        } catch(e) {
            setError((e as string));
        } finally {
            setLoading(false);
        }
    }

    async function loginToGifbox() {
        try {
            if (email() && password()) {
                gbClient.createSession((email() as any), (password() as any), "Solenoid Client").catch((e) => {
                    throw e
                });
            } else {
                throw "You need to provide an Email/Password :/";
            }
        } catch (e) {
            setError((e as string));
        } finally {
            setLoggedIn(true);
        }
    }

    function addToText(s: string) {
            props.setMessage(props.message() + " " + s)
    }

    async function searchGB() {
        try {
            await gbClient.post.searchPosts(query(), 100, 0).then((e) => {
                setGifs(e.hits);
            }).catch((e) => {
                throw e;
            })
        } catch (e) {
            setError((e as string));
        } finally {

        }
    }

    createEffect(async () => {
        if(tab() === 1 && loggedIn()) {
            await requestPopularGifs().then((e) => {
                setGifs((e as any));
            })
        }
    }, [tab()])

    return (
        <div class="solenoid-picker">
            {props.type === "emoji" ? (<div class="tab-container">
                <span class="tab" aria-selected={tab() === 0} onClick={() => setTab(0)}>Emojis</span>
                <span class="tab" aria-selected={tab() === 1} onClick={() => setTab(1)}>Gifs</span>
            </div>) : (
                <div class="tab-container">
                    <span class="tab">You won't see others reactions. See <a href="https://github.com/stationaryStation/Solenoid/issues/8">#8</a></span>
                </div>
            )}
            {tab() === 0 ? (
                <div class="solenoid-picker-grid">
                <For each={Object.entries(emojiDictionary)}>
                    {(emoji) => {
                        console.log(emoji);
                        if (emoji[1].startsWith("custom:")) {
                            return (
                                <div class="custom-container">
                                <img
                                    src={`https://dl.insrt.uk/projects/revolt/emotes/${emoji[1].substring(7)}`}
                                    class="emoji-custom"
                                    onClick={() => {
                                        if(props.type === "emoji") {
                                            addToText(`:${emoji[0]}:`)
                                        } else {
                                            props.messageToReact?.react(emoji[0])
                                        }

                                    }}
                                />
                            </div>)
                        } else {
                            return (
                                <span
                                    title={":" + emoji[0] + ":"}
                                    class="emoji"
                                    onClick={() => {
                                        if(props.type === "emoji") {
                                            addToText(`:${emoji[0]}:`)
                                        } else {
                                            props.messageToReact?.react(emoji[1])
                                            props.setOpen(false);
                                        }

                                    }}
                                >
                                    {emoji[1]}
                                </span>
                            )
                        }

                    }}
                </For>
            </div>
            ) : (<>
                {loggedIn() ? (
                    <div class="solenoid-picker-grid gifbox">
                    <div>
                        <input role="searchbox" placeholder="Browse GIFBox" value={query()} onChange={(e) => setQuery(e.currentTarget.value)}/>
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
                                <div class="gif-container"
                                onClick={() => addToText(`https://api.gifbox.me/file/posts/${gif.file.fileName}`)}>
                                <img
                                class="gif"
                                src={`https://api.gifbox.me/file/posts/${gif.file.fileName}`}
                                />
                                </div>
                            )
                        }}
                    </For>)}
                    {gifs()!.length < 0 && (
                        <p>{error()}</p>
                    )}
                    </div>
                ): (
                    <div class="solenoid-gifbox-login">
                        <span class="needs-login-gifbox">You need to log into GIFBox before using this feature...</span>
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
            )}
        </div>
    )
}
