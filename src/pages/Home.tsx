import type { Component } from "solid-js";

const HomePage: Component = () => {
  return (
    <section>
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
      <p>VeiledProduct80: Help me realize i forgot the masquerade part</p>
      <p>
        Mclnooted: <b>sex</b>
      </p>
    </section>
  );
};

export default HomePage;
