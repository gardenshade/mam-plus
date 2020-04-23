class ToggleHiddenRequesters implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Requests,
        type: 'checkbox',
        title: 'toggleHiddenRequesters',
        desc: `Hide hidden requesters`,
    };
    private _tar: string = '#torRows';
    private _searchList: NodeListOf<HTMLLIElement> | undefined;

    constructor() {
        Util.startFeature(this._settings, this._tar, ['requests']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private async _init(): Promise<void> {
        this._searchList = await this._getRequestList();
        this._filterResults(this._searchList);

        Check.elemObserver(this._tar, async () => {
            this._searchList = await this._getRequestList();
            this._filterResults(this._searchList);
        });
    }

    private _getRequestList(): Promise<NodeListOf<HTMLLIElement>> {
        return new Promise((resolve, reject) => {
            // Wait for the requests to exist
            Check.elemLoad('#torRows .torRow .torRight').then(() => {
                // Grab all requests
                const reqList:
                    | NodeListOf<HTMLLIElement>
                    | null
                    | undefined = document.querySelectorAll(
                    '#torRows .torRow',
                ) as NodeListOf<HTMLLIElement>;

                if (reqList === null || reqList === undefined) {
                    reject(`reqList is ${reqList}`);
                } else {
                    resolve(reqList);
                }
            });
        });
    }

    private _filterResults(list: NodeListOf<HTMLLIElement>) {
        list.forEach((request) => {
            const requester: HTMLAnchorElement | null = request.querySelector(
                '.torRight a',
            );
            if (requester === null) {
                request.style.display = 'none';
            }
        });
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}
