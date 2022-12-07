import { Channel } from "revolt.js";
import { uploadAttachment } from "revolt-toolset";
import { setAttachments } from "~/components/ui/compose/MessageBox";

// TODO: Add Attachment Support

const sendMessageToChannel = async (channel: Channel, content: string, attachments?: FileList) => {
    try {
        if (attachments && attachments.length <= 5) {
            console.log(attachments);
            // Thank u meow <3
            const FILEARRAY = await Promise.all([...attachments].map((file) => uploadAttachment(file.name, file, "attachments"))).catch((e) => {
                throw e;
            });

            channel
                .sendMessage({
                    content,
                    attachments: FILEARRAY,
                })
                .catch((e) => {
                    throw e;
                });

            setAttachments();
        } else {
            await channel.sendMessage(content).catch((e) => {
                throw e;
            });
        }
    } catch (e) {
        console.error("Failed to send:", content, "\nTraceback:\n", e);
    }
};

export { sendMessageToChannel };
