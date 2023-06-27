import { SystemMessage, SystemMessageType } from 'revkit';
import type { Component } from 'solid-js';
import { Markdown } from '../../../markdown';

const SystemMessageBase: Component<{ sysmessage: SystemMessage }> = ({ sysmessage }) => {
    if (sysmessage.detail.type === SystemMessageType.UserJoined) {
        return (
            <div class='flex items-center gap-2'>
                <div class='w-10 h-10'>
                    <img class='avatar rounded-lg' src='/system.webp' />
                </div>
                <div class='flex flex-col gap-2'>
                    <div>
                        <span class='font-semibold'>System</span>
                    </div>
                    <div>
                        <Markdown
                            content={`:01GJTC4RD6XAJXRAAM30KW25VD: | Hello, ${sysmessage.detail.user.username}!`}
                        />
                    </div>
                </div>
            </div>
        );
    } else if (sysmessage.detail.type === SystemMessageType.UserLeft) {
        return (
            <div class='flex items-center gap-2'>
                <div class='w-10 h-10'>
                    <img class='avatar rounded-lg' src='/system.webp' />
                </div>
                <div class='flex flex-col gap-2'>
                    <div>
                        <span class='font-semibold'>System</span>
                    </div>
                    <div>
                        <Markdown
                            content={`:01GJTC4RD6XAJXRAAM30KW25VD: | Bye, ${sysmessage.detail.user.username}!`}
                        />
                    </div>
                </div>
            </div>
        );
    } else if (sysmessage.detail.type === SystemMessageType.UserKicked) {
        return (
            <div class='flex items-center gap-2'>
                <div class='w-10 h-10'>
                    <img class='avatar rounded-lg' src='/system.webp' />
                </div>
                <div class='flex flex-col gap-2'>
                    <div>
                        <span class='font-semibold'>System</span>
                    </div>
                    <div>
                        <Markdown
                            content={`:01GJTC4RD6XAJXRAAM30KW25VD: | ${sysmessage.detail.user.username} was ejected because he was too suspicious`}
                        />
                    </div>
                </div>
            </div>
        );
    } else if (sysmessage.detail.type === SystemMessageType.UserBanned) {
        return (
            <div class='flex items-center gap-2'>
                <div class='w-10 h-10'>
                    <img class='avatar rounded-lg' src='/system.webp' />
                </div>
                <div class='flex flex-col gap-2'>
                    <div>
                        <span class='font-semibold'>System</span>
                    </div>
                    <div>
                        <Markdown
                            content={`:01GJTC4RD6XAJXRAAM30KW25VD: | ${sysmessage.detail.user.username} was struck by the ban hammer`}
                        />
                    </div>
                </div>
            </div>
        );
    }
};

export { SystemMessageBase };
