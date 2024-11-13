import { IRemoteAddon } from '@heraclius/remote';
import { IRemoteCommandHandler } from '@heraclius/remote';
import { Remote } from '@heraclius/remote';

export declare class RemoteAddonVue implements IRemoteAddon {
    use(remote: Remote): IRemoteCommandHandler[];
}

export { }
