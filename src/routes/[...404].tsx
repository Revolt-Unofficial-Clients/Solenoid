import { A } from "solid-start";
// TODO: Redirect user to Client on 404 Page

export default function NotFound() {
    return (
        <main class="text-center mx-auto text-gray-700 p-4">
            <h1>Whoops!</h1>
            <p>Page not found</p>
            <A href="/">Return to client</A>
        </main>
    );
}
