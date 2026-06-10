/**
 * Clarity masque parfois le href des <link rel="stylesheet"> (depuis fin 2025),
 * ce qui fait apparaître les replays Instagram/Facebook comme du HTML brut.
 * Script inline = exécution avant hydratation React (WebView Meta souvent lent).
 * @see https://learn.microsoft.com/en-us/answers/questions/5648504/
 */
const UNMASK_SCRIPT = `(function(){function u(){document.querySelectorAll('link[rel="stylesheet"][href]').forEach(function(l){l.setAttribute('data-clarity-unmask','true')})}u();document.addEventListener('DOMContentLoaded',u);new MutationObserver(u).observe(document.documentElement,{childList:true,subtree:true})})();`

export function ClarityStylesheetUnmaskHeadScript() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: UNMASK_SCRIPT }}
    />
  )
}
