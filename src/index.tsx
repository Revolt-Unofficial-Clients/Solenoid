/* @refresh reload */
import { render } from 'solid-js/web';

import App from './App';
import { A, Navigate, Outlet, Route, Router, Routes } from '@solidjs/router';

import { inject } from '@vercel/analytics';
import { ClientProvider } from './components/providers/client';

inject();

// TODO: Split App into separate pages

render(
    () => (
        <ClientProvider>
            <Router>
                <Routes>
                    <Route component={App} path={'/'} />
                    <Route
                        component={() => (
                            <div>
                                <p>Outlet Test</p>
                                <Outlet />
                            </div>
                        )}
                        path={'/outletTest'}>
                        <Route
                            component={() => (
                                <div>
                                    <p>Index</p>
                                    <A href='/outletTest/1'></A>
                                </div>
                            )}
                            path={'/'}
                        />
                        <Route component={() => <p>Page 1</p>} path={'/1'} />
                        <Route component={() => <p>Page 2</p>} path={'/2'} />
                        <Route
                            component={() => <Navigate href='/outletTest' />}
                            path={'*'}
                        />
                    </Route>
                </Routes>
            </Router>
        </ClientProvider>
    ),
    document.getElementById('root') as HTMLElement
);
