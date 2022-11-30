import { selectedServer } from "../servers";
import ChannelList from "../servers/lists/ChannelList";

const ChannelSidebar = () => {
    return (
        <div class="bg-slate-300 dark:bg-slate-800 h-screen w-64 m-0 flex shrink-0 grow-0 overflow-scroll">
            {/* TODO: Add Direct Message Support */}
            <ChannelList server={selectedServer()} />
        </div>
    );
};

export default ChannelSidebar;