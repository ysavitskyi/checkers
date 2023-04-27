export const composeCls = (
  cls: string[],
  clsComputable: Record<string, boolean | undefined>
) => {
  return Object.entries(clsComputable)
    .reduce((acc, [key, value]) => {
      if (value) {
        acc.push(key)
      }

      return acc
    }, cls)
    .join(' ')
}
