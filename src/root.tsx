// @refresh reload
import { Suspense } from "solid-js";
import {
    A,
    Body,
    ErrorBoundary,
    FileRoutes,
    Head,
    Html,
    Meta,
    Routes,
    Scripts,
    Title,
} from "solid-start";
import { ThemeProvider } from "solid-styled-components";
import { theme } from "./components/solenoid/ui/DefaultTheme";
import "./root.css";
import { currentTheme } from "~/components/solenoid/ui/DefaultTheme";

// TODO: Backend: Add ThemeProvider

export default function Root() {
    return (
        <Html lang="en">
            <Head>
                <Title>Solenoid Client</Title>
                <Meta charset="utf-8" />
                <Meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
            </Head>
            <Body>
                <ThemeProvider theme={currentTheme() || theme}>
                    <Suspense>
                        <ErrorBoundary>
                            <Routes>
                                <FileRoutes />
                            </Routes>
                        </ErrorBoundary>
                    </Suspense>
                </ThemeProvider>
                <Scripts />
            </Body>
        </Html>
    );
}
