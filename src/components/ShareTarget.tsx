import { useEffect } from "react"
import { useUploadMatch } from "./UploadMatch"

export const ShareTarget = () => {
  const uploadMatch = useUploadMatch()
  useEffect(() => {
    navigator.serviceWorker.controller?.postMessage({ action: "getSharedData" })

    const receive = async (event: MessageEvent) => {
      if (!(event.data instanceof ArrayBuffer)) return

      await uploadMatch(event.data)
      navigator.serviceWorker.controller?.postMessage({ action: "clearSharedData" })
    }

    navigator.serviceWorker.addEventListener("message", receive)
    return () => navigator.serviceWorker.removeEventListener("message", receive)
  })

  return <p>Share target</p>
}
