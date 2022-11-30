import { Session } from "revolt.js";
import { createSignal } from "solid-js";
import { A as Link, useNavigate } from "solid-start";
import { loginWithEmail, loginWithToken } from "~/libs/revolt/login";
import { getFromStorage, store } from "~/libs/storage/user";
import { client as Revolt } from "~/libs/revolt";

const [email, setEmail] = createSignal<string>("");
const [password, setPassword] = createSignal<string>("");
const [token, setToken] = createSignal<string>("");
const [loading, setLoading] = createSignal<boolean>(false);


export default function Home() {

  // FIXME: Login to another account after account logout

  const navigate = useNavigate();

  getFromStorage<Session>("session").then((sesisonData) => {
    if (sesisonData) {
      Revolt.useExistingSession(sesisonData).then(() => {
        navigate("/client", {replace: true});
      });
    }
  });

  return (
    <main>
      <h1>Solenoid Client (Rewrite // Very Beta)</h1>
      <p>This is a early rewrite of the original solenoid client</p>
      <form id="email" onSubmit={async (e) => {
        try {
          e.preventDefault();
          setLoading(true)
          await loginWithEmail(email(), password()).then(() => {
            store("session", Revolt.session);
            navigate("/client");
          }).catch((e) => {
            throw e;
          })
        } catch (e) {
          alert(e);
        } finally {
          setLoading(false);
        }
      }}>
        <input type="email" value={email()} onChange={(e) => setEmail(e.currentTarget.value)} placeholder="Revolt Email"/>
        <input type="password" value={password()} onChange={(e) => setPassword(e.currentTarget.value)} placeholder="Account Password"/>
        <button type="submit" disabled={loading()}>Login into Solenoid</button>
      </form>
      <form id="token" onSubmit={async (e) => {
        try {
          e.preventDefault();
          setLoading(true)
          await loginWithToken(token()).then(() => {
            navigate("/client");
          }).catch((e) => {
            throw e;
          })
        } catch (e) {
          alert(e);
        } finally {
          setLoading(false);
        }
      }}>
        <input id="token-input" type="password" value={token()} placeholder="Revolt User/Bot Token" onChange={(e) => setToken(e.currentTarget.value)}/>
        <button type="submit" disabled={loading()}>Login with Token</button>
      </form>
    </main>
  );
}
