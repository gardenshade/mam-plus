/**
 * ===========================
 * PLACE ALL M+ FEATURES HERE
 * ===========================
 *
 * Nearly all features belong here, as they should have internal checks
 * for DOM elements as needed. Only core features should be placed in `app.ts`
 *
 * This determines the order in which settings will be generated on the Settings page.
 * Settings will be grouped by type, but Features of one type that are called before
 * other Features of the same type will appear first.
 *
 * The order of the feature groups is not determined here.
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
        new PlaintextSearch();

        // Initialize Torrent Page functions
        new GoodreadsButton();
        new TorGiftDefault();

        // Initialize Vault functions
        new SimpleVault();

        // Initialize User Page functions
        new UserGiftDefault();
    }
}
