export interface Dictionary<T> {
  [key: string]: T
}

export const composeCls = (
  cls: string[],
  clsComputable: Dictionary<boolean | undefined>
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
