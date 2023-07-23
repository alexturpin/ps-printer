const pad = (n: number) => n.toString().padStart(2, "0")

export const formatDate = (date: Date | number) => {
  if (typeof date === "number") date = new Date(date)
  return (
    [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join("-") +
    " " +
    [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join(":")
  )
}
