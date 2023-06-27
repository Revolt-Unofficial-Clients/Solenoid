import { createContext, useContext, ParentComponent } from 'solid-js';
import { Client } from 'revkit';

const ClientContext = createContext<Client>();

export const client = new Client();

export const ClientProvider: ParentComponent = (props) => {
    return (
        <ClientContext.Provider value={client}>{props.children}</ClientContext.Provider>
    );
};

export const useClient = () => useContext(ClientContext)!;
