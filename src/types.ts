/**
 * Types, Interfaces, etc.
 */

type ValidPage =
    | 'home'
    | 'browse'
    | 'requests'
    | 'torrent'
    | 'shoutbox'
    | 'vault'
    | 'user'
	| 'forum'
    | 'settings';

type BookData = 'book' | 'author' | 'series';

enum SettingGroup {
    'Global',
    'Home',
    'Search',
    'Requests',
    'Torrent Page',
    'Shoutbox',
    'Vault',
    'User Pages',
	'Forum Pages',
    'Other',
}

type ShoutboxUserType = 'priority' | 'mute';

interface ArrayObject {
    [key: string]: string[];
}

interface StringObject {
    [key: string]: string;
}

interface BookDataObject extends StringObject {
    ['extracted']: string;
    ['desc']: string;
}

interface SettingGlobObject {
    [key: number]: FeatureSettings[];
}

interface FeatureSettings {
    scope: SettingGroup;
    title: string;
    type: 'checkbox' | 'dropdown' | 'textbox';
    desc: string;
}

interface AnyFeature extends FeatureSettings {
    tag?: string;
    options?: StringObject;
    placeholder?: string;
}

interface Feature {
    settings: CheckboxSetting | DropdownSetting | TextboxSetting;
}

interface CheckboxSetting extends FeatureSettings {
    type: 'checkbox';
}

interface DropdownSetting extends FeatureSettings {
    type: 'dropdown';
    tag: string;
    options: StringObject;
}

interface TextboxSetting extends FeatureSettings {
    type: 'textbox';
    tag: string;
    placeholder: string;
}

// navigator.clipboard.d.ts

// Type declarations for Clipboard API
// https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
interface Clipboard {
    writeText(newClipText: string): Promise<void>;
    // Add any other methods you need here.
}

interface NavigatorClipboard {
    // Only available in a secure context.
    readonly clipboard?: Clipboard;
}

interface NavigatorExtended extends NavigatorClipboard {}
