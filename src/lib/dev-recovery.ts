// Development-only recovery for the long-lived Replit canvas preview tab.
//
// When the dev server restarts, the preview tab does NOT do a full document
// load — Vite's HMR client just reconnects its WebSocket. During the brief
// restart window an in-flight dynamic import (e.g. the TanStack Start client
// entry) can fail and then be re-fetched, leaving the tab with two React
// module instances in memory ("more than one copy of React" -> "Invalid hook
// call"). A single full reload re-fetches one consistent module graph and
// clears it; a fresh load (verified via curl, the production build, and a
// headless browser) never has this problem, so the reload cannot loop.
//
// This is paired with the onRecoverableError filter in src/client.tsx, which
// handles the *other* canvas-only artifact (the benign hydration mismatch from
// the platform's injected devtools node). Together they keep the dev console
// clean of these preview-environment artifacts. Both are stripped from
// production builds and never touch protocol/business logic.

export const DEV_HYDRATION_RECOVERY_SCRIPT = `
(function(){try{
  var KEY='syndicate.devRecoverAt';
  // Match ONLY the duplicate-React / invalid-hook-call skew. Deliberately does
  // NOT match hydration mismatches (handled cleanly by onRecoverableError) so a
  // recovered load is never re-triggered into a reload loop.
  var RE=/Invalid hook call|more than one copy of React/i;
  var done=false;
  function recover(){
    if(done)return;
    try{
      var now=Date.now();
      var last=parseInt(sessionStorage.getItem(KEY)||'0',10);
      if(now-last>8000){done=true;sessionStorage.setItem(KEY,String(now));location.reload();}
    }catch(e){}
  }
  var oe=console.error;
  console.error=function(){
    try{var a=Array.prototype.map.call(arguments,function(x){return (x&&x.message)||String(x);}).join(' ');if(RE.test(a))recover();}catch(_){}
    return oe.apply(this,arguments);
  };
  window.addEventListener('error',function(e){
    try{var t=((e&&e.message)||'')+' '+((e&&e.error&&e.error.stack)||'');if(RE.test(t))recover();}catch(_){}
  });
}catch(e){}})();
`.trim();
