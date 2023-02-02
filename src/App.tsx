import Axios from "axios";
import { Reaction, runInAction } from "mobx";
import {
  Component,
  createEffect, enableExternalSource,
  For,
  Show
} from "solid-js";
import { produce } from "solid-js/store";
import { ulid } from "ulid";
import "./styles/main.css";

// Components
import { Login as LoginComponent } from "./components/ui/common/Login";
import { MessageContainer } from "./components/ui/messaging/Message/Container";
// Types
import type { AxiosRequestConfig } from "axios";

// Revolt Client
import { revolt as client } from "./lib/revolt";

// Import signals and stores
import ChannelNavigation from "./components/ui/navigation/navbar/channels";
import Navigation from "./components/ui/navigation/navbar/servers";
import Userbar from "./components/ui/navigation/Userbar";
import Settings from "./components/ui/settings";
import * as Solenoid from "./lib/solenoid";

// Way to know if user notifications are enabled
let notification_access: boolean;

// Functions
const onImageChange = (e: any) => {
  Solenoid.setImages([...e.target.files]);
};
const onAvatarChange = (
  e: Event & { currentTarget: HTMLInputElement; target: Element }
) => {
  if (e.currentTarget.files) Solenoid.setAvatarImage(e.currentTarget.files);
};

// Setup
client.on("ready", async () => {
  Solenoid.setLoggedIn(true);
  Solenoid.setUser("username", client.user?.username);
  Solenoid.setUser("user_id", client.user?.id);
  if (Solenoid.settings.debug && Solenoid.settings.session_type === "token") {
    console.info(`Logged In as ${client.user?.username} (Bot Mode)`);
  } else if (
    Solenoid.settings.debug &&
    Solenoid.settings.session_type === "email"
  ) {
    console.info(`Logged In as ${client.user?.username}`);
  }
});

// Update Status Automatically
client.on("packet", async (info) => {
  if (info.type === "UserUpdate" && info.id === client.user?.id) {
    Solenoid.setSettings("status", info.data.status?.presence);
    Solenoid.setSettings("statusText", info.data.status?.text);
  }
});

// Image Attaching
createEffect(() => {
  const newImageUrls: any[] = [];
  Solenoid.images()?.forEach((image) =>
    newImageUrls.push(URL.createObjectURL(image))
  );
  Solenoid.setImgUrls(newImageUrls);
});

// Upload image to autumn.revolt.chat
async function uploadFile(
  autummURL: string,
  tag: string,
  file: File,
  config?: AxiosRequestConfig
) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await Axios.post(`${autummURL}/${tag}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    ...config,
  });

  return res.data.id;
}

// Send message with file
async function sendFile(content: string) {
  const attachments: string[] = [];

  const cancel = Axios.CancelToken.source();
  const files: any | undefined = Solenoid.images();

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      attachments.push(
        await uploadFile(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          client.config.features.autumn.url,
          "attachments",
          file,
          {
            cancelToken: cancel.token,
          }
        )
      );
      if (Solenoid.settings.debug) console.log(attachments);
    }
  } catch (e) {
    if ((e as any)?.message === "cancel") {
      return;
    } else {
      if (Solenoid.settings.debug) console.log((e as any).message);
    }
  }

  const nonce = ulid();

  try {
    await Solenoid.servers.current_channel?.send({
      content,
      nonce,
      attachments,
      replies: Solenoid.replies(),
    });
  } catch (e: unknown) {
    if (Solenoid.settings.debug) console.log((e as any).message);
  }
}

// Send Message Handler
async function sendMessage(message: string) {
  const nonce = ulid();
  if (Solenoid.servers.current_channel) {
    if (Solenoid.images()) {
      await sendFile(message);
    } else if (Solenoid.replies()) {
      Solenoid.servers.current_channel?.send({
        content: message,
        replies: Solenoid.replies(),
        nonce,
      });
    } else {
      Solenoid.servers.current_channel?.send({
        content: message,
        nonce,
      });
    }
  }
  Solenoid.setNewMessage("");
  Solenoid.setReplies([]);
  Solenoid.setImages(undefined);
  Solenoid.setShowPicker(false);
}

// AutoLogin
async function loginWithSession(session: unknown & { action: "LOGIN", token: string }) {
  try {
    if (Solenoid.usr.session_type === "email" && session) {
      await client.login(session.token, "user").catch((e) => {
        throw e;
      });
      Solenoid.setSettings("session_type", "email");
      Solenoid.setSettings("session", session);
      Solenoid.setLoggedIn(true);
    } else {
      return;
    }
  } catch (e) {
    Solenoid.setSettings("session", null);
    Solenoid.setUser("session_type", undefined);
    Solenoid.setUser("user_id", undefined);
    Solenoid.setUser("username", undefined);
  }
}

// Mobx magic (Thanks Insert :D)
let id = 0;
enableExternalSource((fn, trigger) => {
  const reaction: any = new Reaction(`externalSource@${++id}`, trigger);
  return {
    track: (x) => {
      let next;
      reaction.track(() => (next = fn(x)));
      return next;
    },
    dispose: () => reaction.dispose(),
  };
});


// Automatically log in when session is found and not logged in
if (Solenoid.settings.session && !Solenoid.loggedIn())
  loginWithSession(Solenoid.settings.session);

const App: Component = () => {
  return (
    <div class="flex flex-grow-0 flex-col w-full h-screen">
      <LoginComponent
        client={client}
        userSetter={Solenoid.setUser}
        configSetter={Solenoid.setSettings}
        solenoid_config={Solenoid.settings}
        logged={Solenoid.loggedIn}
        logSetter={Solenoid.setLoggedIn}
      />
      {Solenoid.loggedIn() && (
        <>
          <div class="flex h-full">
            <Navigation />
            <Show when={Solenoid.servers.current_server}>
              <ChannelNavigation />
            </Show>
            <div class="container block w-full overflow-y-scroll">
              {Solenoid.servers.isHome && (
                <div class="home">
                  <h1>Solenoid (Beta)</h1>
                  {window.location.hostname === "localhost" && (
                    <h3>Running on Local Server</h3>
                  )}
                  <p>A lightweight client for revolt.chat made with SolidJS</p>
                  <br />
                  <h3>Contributors</h3>
                  <hr />
                  <p>Insert: Helped me with Mobx and Revolt.js issues</p>
                  <p>
                    RyanSolid:{" "}
                    <a href="https://codesandbox.io/s/mobx-external-source-0vf2l?file=/index.js">
                      This
                    </a>{" "}
                    code snippet
                  </p>
                  <p>
                    VeiledProduct80: Help me realize i forgot the masquerade
                    part
                  </p>
                  <p>
                    Mclnooted: <b>sex</b>
                  </p>
                </div>
              )}
              <div>
                <MessageContainer />
                {Solenoid.servers.current_channel && <Userbar />}
              </div>
            </div>
          </div>
        </>
      )}
      {Solenoid.settings.show && <Settings />}
    </div>
  );
};

export default App;
