(() => {
  'use strict';
  // Public client configuration only. NEVER put service_role/database passwords here.
  window.SC_ONLINE_CONFIG=Object.freeze({
    enabled:false,
    supabaseUrl:'',
    publishableKey:'',
    redirectUrl:'survivechaos://auth/callback',
    multiplayerUrl:'',
    protocol:'sc.online.v1',
    saveSchema:1,
    maxPlayers:4
  });
})();
