import { precacheAndRoute } from "workbox-precaching"
import { openDB } from "idb"

precacheAndRoute(self.__WB_MANIFEST)

const dbPromise = openDB("myDatabase", 1, {
  upgrade(db) {
    db.createObjectStore("requests")
  },
})

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "POST") {
    event.respondWith(fetch(event.request))
    return
  }

  event.respondWith(
    (async () => {
      const data = await event.request.arrayBuffer()

      const db = await dbPromise
      await db.put("requests", data, "sharedRequest")

      // Redirect to the app
      return Response.redirect("/share", 303)
    })(),
  )
})

self.addEventListener("message", (event) => {
  if (event.data.action === "getSharedData") {
    ;(async () => {
      const db = await dbPromise
      const data = await db.get("requests", "sharedRequest")
      event.source.postMessage(data)
    })()
  } else if (event.data.action === "clearSharedData") {
    ;(async () => {
      const db = await dbPromise
      await db.delete("requests", "sharedRequest")
    })()
  }
})
