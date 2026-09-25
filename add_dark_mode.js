const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /bg-white/g, replace: "bg-white dark:bg-slate-900 transition-colors" },
  { regex: /bg-slate-50(?!.*dark)/g, replace: "bg-slate-50 dark:bg-slate-900/50" },
  { regex: /border-slate-200(?!.*dark)/g, replace: "border-slate-200 dark:border-slate-800" },
  { regex: /border-slate-100(?!.*dark)/g, replace: "border-slate-100 dark:border-slate-800" },
  { regex: /text-slate-800(?!.*dark)/g, replace: "text-slate-800 dark:text-slate-100" },
  { regex: /text-slate-700(?!.*dark)/g, replace: "text-slate-700 dark:text-slate-300" },
  { regex: /text-slate-600(?!.*dark)/g, replace: "text-slate-600 dark:text-slate-400" },
  { regex: /text-slate-500(?!.*dark)/g, replace: "text-slate-500 dark:text-slate-400" },
  { regex: /hover:bg-slate-50(?!.*dark)/g, replace: "hover:bg-slate-50 dark:hover:bg-slate-800/50" },
  { regex: /hover:bg-slate-100(?!.*dark)/g, replace: "hover:bg-slate-100 dark:hover:bg-slate-800" },
  { regex: /bg-slate-100(?!.*dark)/g, replace: "bg-slate-100 dark:bg-slate-800" },
  { regex: /text-slate-900(?!.*dark)/g, replace: "text-slate-900 dark:text-white" }
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const { regex, replace } of replacements) {
        // Only replace if it's not already replaced (naive check handled by negative lookahead in regex)
        // Actually, my regex negative lookahead (?!.*dark) is dangerous because it looks ahead till end of string/line.
        // Let's use a safer replacement.
      }
      
      // Let's do safer replacements
      // First, temporarily replace already existing dark classes to avoid double replacing
      // Actually, since I haven't added dark classes to other pages yet, a simple replace is safe!
      content = content
        .replace(/bg-white/g, 'bg-white dark:bg-slate-900 transition-colors')
        .replace(/bg-slate-50(?!\s+dark:)/g, 'bg-slate-50 dark:bg-slate-900/50')
        .replace(/border-slate-200(?!\s+dark:)/g, 'border-slate-200 dark:border-slate-800')
        .replace(/border-slate-100(?!\s+dark:)/g, 'border-slate-100 dark:border-slate-800')
        .replace(/text-slate-800(?!\s+dark:)/g, 'text-slate-800 dark:text-slate-100')
        .replace(/text-slate-700(?!\s+dark:)/g, 'text-slate-700 dark:text-slate-300')
        .replace(/text-slate-600(?!\s+dark:)/g, 'text-slate-600 dark:text-slate-400')
        .replace(/text-slate-500(?!\s+dark:)/g, 'text-slate-500 dark:text-slate-400')
        .replace(/hover:bg-slate-50(?!\s+dark:)/g, 'hover:bg-slate-50 dark:hover:bg-slate-800/50')
        .replace(/hover:bg-slate-100(?!\s+dark:)/g, 'hover:bg-slate-100 dark:hover:bg-slate-800')
        // Clean up double darks if any
        .replace(/dark:bg-slate-900 transition-colors dark:bg-slate-900 transition-colors/g, 'dark:bg-slate-900 transition-colors')
        .replace(/dark:text-slate-100 dark:text-slate-100/g, 'dark:text-slate-100');
        
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

// Run for both admin and vendor pages
processDirectory(path.join(__dirname, 'admin/src/pages'));
processDirectory(path.join(__dirname, 'vendor/src/pages'));

console.log('Done!');
