import { ref } from 'vue';

const refMap = new Map();
const vnodeMap = new Map();
class RemoteAddonVue {
    use(remote) {
        return [
            {
                for: "v-define-ref",
                handle (cmd) {
                    if (!cmd.name) remote.sendError("ref name cannot be empty");
                    else refMap.set(cmd.name, ref(cmd.value));
                }
            },
            {
                for: "v-undefined-ref",
                handle (cmd) {
                    refMap.delete(cmd.name);
                }
            },
            {
                for: "v-register-create-vnode",
                handle (cmd) {
                    if (!cmd.name) remote.sendError("vnode name cannot be empty");
                    else vnodeMap.set(cmd.name, cmd);
                }
            }
        ];
    }
}

export { RemoteAddonVue };
