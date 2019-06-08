/**
 * PLACE ALL M+ FEATURES HERE
 *
 * Nearly all features belong here, as they should have internal checks
 * for DOM elements as needed
 */
class InitFeatures{
    constructor(){
        // Initialize Global functions
        new HideHome();
        new HideBrowse();
        new VaultLink();
        new MiniVaultInfo();

        // Initialize Browse/Request Page functions
        new ToggleSnatched();
        new StickySnatchedToggle();

        // Initialize Torrent Page functions
        new TorGiftDefault();

        // Initialize Vault functions
        new SimpleVault();

        // Initialize User Page functions
        new UserGiftDefault();
    }
}
