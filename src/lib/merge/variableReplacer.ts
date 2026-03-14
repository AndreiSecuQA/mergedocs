/**
 * Variable replacer utility
 * Handles $variableName substitution in template strings.
 * Regex: /\$([a-zA-Z_][a-zA-Z0-9_]*)/g
 */

const VARIABLE_REGEX = /\$([a-zA-Z_][a-zA-Z0-9_]*)/g

export interface ReplaceResult {
  output: string
  matched: string[]
  unmatched: string[]
}

/**
 * Replace all $variableName occurrences with data[variableName].
 * Unmatched variables are kept as-is.
 */
export function replaceVariables(
  template: string,
  data: Record<string, string>
): ReplaceResult {
  const matched: string[] = []
  const unmatched: string[] = []

  const output = template.replace(VARIABLE_REGEX, (_fullMatch, key: string) => {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      if (!matched.includes(key)) matched.push(key)
      return data[key]
    } else {
      if (!unmatched.includes(key)) unmatched.push(key)
      return `$${key}`
    }
  })

  return { output, matched, unmatched }
}

/**
 * Same as replaceVariables but wraps substituted values in styled <span> tags
 * for use in preview rendering.
 * - Matched: <span class="variable-matched">{value}</span>
 * - Unmatched: <span class="variable-unmatched" title="No data for $key">$key</span>
 */
export function replaceVariablesForPreview(
  template: string,
  data: Record<string, string>
): string {
  return template.replace(VARIABLE_REGEX, (_fullMatch, key: string) => {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key]
      return `<span class="variable-matched">${escapeHtml(value)}</span>`
    } else {
      return `<span class="variable-unmatched" title="No data for $${key}">$${key}</span>`
    }
  })
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}
