import { Channel } from "revolt.js";

// TODO: Add Attachment Support

const sendMessageToChannel = async (channel: Channel, content: string) => {
    try {
        await channel.sendMessage(content).catch(e => {
            throw e
        });
    } catch (e) {
        console.error("Failed to send:", content, "\nTraceback:\n", e);
    }
}

export { sendMessageToChannel }