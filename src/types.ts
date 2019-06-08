/**
 * Types, Interfaces, etc.
 */

type ValidPage = 'browse'|
                'requests'|
                'torrent' |
                'shoutbox' |
                'vault' |
                'user' |
                'settings';

enum SettingGroup {
    'Global',
    'Browse & Search',
    'Torrent Page',
    'Shoutbox',
    'Vault',
    'User Pages',
    'Other'
}

interface ArrayObject {
    [key: string]: string[];
}

interface StringObject {
    [key: string]: string;
}

interface SettingGlobObject {
    [key: number]: FeatureSettings[]
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
