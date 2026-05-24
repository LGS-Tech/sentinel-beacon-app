export type VaultFile = {
  id: string
  name: string
  type: "log" | "media" | "message" | "summary"
  date: string
  preview?: string
}

export type VaultSubFolder = {
  name: string
  files: VaultFile[]
}

export type VaultFolder = {
  id: string
  name: string
  subFolders: VaultSubFolder[]
}

export const vaultFolders: VaultFolder[] = [
  {
    id: "1",
    name: "Case19-03-26",
    subFolders: [
      {
        name: "Logs",
        files: [
          { id: "l1", name: "activity.log", type: "log", date: "Mar 1 2026" },
          { id: "l2", name: "system.log", type: "log", date: "Mar 1 2026" }
        ]
      },
      {
        name: "Media",
        files: [
          {
            id: "m1",
            name: "IntruderLocation.jpg",
            type: "media",
            date: "Mar 1 2026",
            preview: require("../../assets/images/LGSUniFloorPlan.png")
          }
        ]
      },
      {
        name: "Messages",
        files: [
          { id: "msg1", name: "conversation.txt", type: "message", date: "Mar 1 2026" }
        ]
      },
      {
        name: "Summary",
        files: [
          { id: "s1", name: "summary.txt", type: "summary", date: "Mar 1 2026" }
        ]
      }
    ]
  }
]
