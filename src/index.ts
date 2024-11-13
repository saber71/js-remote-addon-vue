import { type IRemoteAddon, type IRemoteCommand, type IRemoteCommandHandler, Remote } from "@heraclius/remote"
import { h, ref, type Ref } from "vue"

interface IRemoteCommandDefineRef extends IRemoteCommand<"v-define-ref"> {
  value: any
  name: string
}

interface IRemoteCommandUndefinedRef extends IRemoteCommand<"v-undefined-ref"> {
  name: string
}

interface IRemoteCommandRegisterCreateVNode extends IRemoteCommand<"v-register-create-vnode"> {
  name: string
  element: string
  attributes?: Record<string, any | IUseRef>
  children?: Array<string | IRemoteCommandRegisterCreateVNode | IUseRef>
}

interface IUseRef {
  name: string
  props?: string[]
}

const refMap = new Map<string, Ref>()
const vnodeMap = new Map<string, IRemoteCommandRegisterCreateVNode>()

function useRef(arg: any, remote: Remote) {
  if (!arg?.name) return arg
  const data: IUseRef = arg
  const ref = refMap.get(data.name)
  if (!ref) {
    remote.sendError(`找不到ref ${data.name}`)
    return arg
  }
  if (!data.props) return ref.value
  let value = ref.value
  for (let prop of data.props) {
    value = value[prop]
  }
  return value
}

export class RemoteAddonVue implements IRemoteAddon {
  use(remote: Remote): IRemoteCommandHandler[] {
    function createVNode(cmd: IRemoteCommandRegisterCreateVNode): any {
      const attributes = Object.assign({}, cmd.attributes)
      for (let [key, value] of Object.entries(attributes)) {
        if (typeof value === "object") attributes[key] = useRef(value, remote)
      }
      const children = cmd.children ?? []
      return h(
        cmd.element,
        attributes,
        children.map((child) => {
          if (typeof child == "object") {
            if ("type" in child) return createVNode(child as IRemoteCommandRegisterCreateVNode)
            return useRef(child, remote)
          }
          return child
        })
      )
    }

    return [
      {
        for: "v-define-ref",
        handle(cmd: IRemoteCommandDefineRef) {
          if (!cmd.name) remote.sendError("ref name cannot be empty")
          else refMap.set(cmd.name, ref(cmd.value))
        }
      },
      {
        for: "v-undefined-ref",
        handle(cmd: IRemoteCommandUndefinedRef) {
          refMap.delete(cmd.name)
        }
      },
      {
        for: "v-register-create-vnode",
        handle(cmd: IRemoteCommandRegisterCreateVNode) {
          if (!cmd.name) remote.sendError("vnode name cannot be empty")
          else vnodeMap.set(cmd.name, cmd)
        }
      }
    ]
  }
}
