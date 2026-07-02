const fs = require('fs')
const path = require('path')

// Find all hast-util-to-estree packages
const pnpmDir = path.join(__dirname, '..', 'node_modules', '.pnpm')

if (!fs.existsSync(pnpmDir)) {
  console.log('No .pnpm directory found, skipping patch')
  process.exit(0)
}

const dirs = fs.readdirSync(pnpmDir).filter(d => d.startsWith('hast-util-to-estree@'))

for (const dir of dirs) {
  const elementFile = path.join(pnpmDir, dir, 'node_modules', 'hast-util-to-estree', 'lib', 'handlers', 'element.js')

  if (!fs.existsSync(elementFile)) {
    continue
  }

  let content = fs.readFileSync(elementFile, 'utf8')

  // Check if already patched
  if (content.includes('// PATCHED')) {
    console.log(`Already patched: ${elementFile}`)
    continue
  }

  // Replace the import and add a fallback
  const patchedContent = content.replace(
    "import styleToJs from 'style-to-js'",
    `// PATCHED - handle CJS/ESM compatibility
import styleToJsModule from 'style-to-js'
const styleToJs = typeof styleToJsModule === 'function' ? styleToJsModule : styleToJsModule.default || styleToJsModule`
  )

  fs.writeFileSync(elementFile, patchedContent, 'utf8')
  console.log(`Patched: ${elementFile}`)
}

console.log('Done patching hast-util-to-estree')
