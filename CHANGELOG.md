# [1.10.0](https://github.com/chatatechnologies/react-autoql/compare/v1.9.0...v1.10.0) (2020-09-11)


### Bug Fixes

* **dashboards:** fix "no data supplied" error in split view ([b68916f](https://github.com/chatatechnologies/react-autoql/commit/b68916f567ac9f06a027b48bd1ffae72c26d968f))
* **dashboards:** fix onSuccessCallback for dashboards ([0394b32](https://github.com/chatatechnologies/react-autoql/commit/0394b327d3767f2b11f2c05bb29c7f95869c8a89))
* **explore queries:** fix safetynet bug in explore queries ([287ea43](https://github.com/chatatechnologies/react-autoql/commit/287ea43d656d1549c3ae34c3382d7de1e800ee51))
* **notifications:** fix various notifications bugs ([ad0dac8](https://github.com/chatatechnologies/react-autoql/commit/ad0dac86ce830dde868b67332734795941c7d4de))
* **notifications:** various notification bug fixes ([3fa7d21](https://github.com/chatatechnologies/react-autoql/commit/3fa7d21311ef213d50287173177b578a78f0449e))


### Features

* **demo page:** add review page to test sentiment analysis ([dd7989b](https://github.com/chatatechnologies/react-autoql/commit/dd7989bbebcf8cb5dca7798fc7fb24c3e838383e))
* **notifications:** add validation to all queries in notification modal ([249ce55](https://github.com/chatatechnologies/react-autoql/commit/249ce552a3f8d2533d31b785303accc0bfd7390e))
* **notifications:** enable notifications on prod ([369f8e7](https://github.com/chatatechnologies/react-autoql/commit/369f8e771293a3451c4a805babab9b618c9defd1))
* **notifications:** use long polling for new notification count ([c1fa96b](https://github.com/chatatechnologies/react-autoql/commit/c1fa96b043710dd84007225979b7e5dad67276ae))
* **reviews:** add "clear" button beside star selection ([b8bb8b3](https://github.com/chatatechnologies/react-autoql/commit/b8bb8b336f56c8c0f840a70d2d5e4c94275d27a0))
* **tables and charts:** sort tables by date descending, sort chart axis by date ascending (default) ([064b742](https://github.com/chatatechnologies/react-autoql/commit/064b7427eb2037b2ad35a1c820066fdf81315e02))
* **test page:** enable notifications on heroku prod ([dc2e658](https://github.com/chatatechnologies/react-autoql/commit/dc2e6580e308bfa415a5c5c6eed64c93714d4a33))

# [1.9.0](https://github.com/chatatechnologies/react-autoql/compare/v1.8.0...v1.9.0) (2020-08-11)


### Bug Fixes

* **charts:** fix axis labels for stacked charts ([7c2fd9b](https://github.com/chatatechnologies/react-autoql/commit/7c2fd9b2f6b90f8ad4643487f1f3948fcfd2708c))
* **cosmetic:** fix flickering bug in modals (changed modal library) and improve transitions ([2745a81](https://github.com/chatatechnologies/react-autoql/commit/2745a81dcbcc6e3d4d9b3ceb62a5615708c2207e))
* **dashboards:** fix query validation in second half of split view tiles ([6f290e6](https://github.com/chatatechnologies/react-autoql/commit/6f290e61c499b31ea67c984ad6fa6676d866229c))
* **dashboards:** persist setting to skip query validation after picking a suggestion the first time ([72c84be](https://github.com/chatatechnologies/react-autoql/commit/72c84be506a0851c3150cdf6f9531dae54c22375))
* **modals:** fix styling for new modal library ([16f7253](https://github.com/chatatechnologies/react-autoql/commit/16f725338e861c2c4871b4e15ece18e1e4ea9980))
* **safari:** notification footer gets cut off when notification is expanded ([d9ed930](https://github.com/chatatechnologies/react-autoql/commit/d9ed930de464c2e01f23a910578f9692e253e7f9))
* do not show table options if all columns are hidden ([89440b8](https://github.com/chatatechnologies/react-autoql/commit/89440b8feb0581be30cc48384daa2195b08019a8))


### Features

* **data messenger:**  Invert default colour for DM handle (blue background with white logo) ([08ba8cb](https://github.com/chatatechnologies/react-autoql/commit/08ba8cb65dc4fd3a86d0e9d8aa57b774c37184a8))
* **safetynet:** add disambiguation params from failed validation to query call ([7f82972](https://github.com/chatatechnologies/react-autoql/commit/7f82972b89b71ccee14b8c55ca0c9d16025504c0))

# [1.8.0](https://github.com/chatatechnologies/react-autoql/compare/v1.7.1...v1.8.0) (2020-07-08)


### Bug Fixes

* **charts:** reset selection in axis selector popup if user clicks outside (cancels) ([faedf14](https://github.com/chatatechnologies/react-autoql/commit/faedf14c3f102ff86531b8ec8e7af485f9f4b1cd))
* **dashboards:** fix bug where options tooltips disappeared after opening more options menu ([3f243c0](https://github.com/chatatechnologies/react-autoql/commit/3f243c082db75986686918fef3db5bc394983db7))
* **dashboards:** fix bug where toolbar options in dashboard tiles are not updating properly ([5058923](https://github.com/chatatechnologies/react-autoql/commit/5058923638a21175b4d7eaad4d4e0a07726ca0d8))
* **data messenger:** fix bug where all columns are hidden and the message gets cut off ([03ad207](https://github.com/chatatechnologies/react-autoql/commit/03ad20707a834db522aab6eae24616aad03c87ff))
* **data messenger:** fix bug where popup menus stay open after closing data messenger ([4f89ca0](https://github.com/chatatechnologies/react-autoql/commit/4f89ca02c00505191069d987dd8c17f675e33c71))
* **styles:** change styles of dashboard tiles to have bigger text and buttons ([4bec330](https://github.com/chatatechnologies/react-autoql/commit/4bec33052e4b3524198bb64520718181317cf8bf))
* **tables:** fix bug in Safari and Firefox where date pivots were throwing an error ([633766d](https://github.com/chatatechnologies/react-autoql/commit/633766d5d9fcdd6291e3916f3c23d8a2cc926e0d))


### Features

* **data messenger:** resize message bubbles after resizing browser window (if necessary) ([24faad4](https://github.com/chatatechnologies/react-autoql/commit/24faad4d9669e78e9bda2a9c846299e3a476b83c))

## [1.7.1](https://github.com/chatatechnologies/react-autoql/compare/v1.7.0...v1.7.1) (2020-07-02)


### Bug Fixes

* **charts:** fix range for bubble charts so bubbles always fit inside chart area ([6d99433](https://github.com/chatatechnologies/react-autoql/commit/6d994336bff77b495588f51875afe92b13405d78))
* **charts:** fix scale of heatmap charts so they dont get cut off on the right side ([f67bd3f](https://github.com/chatatechnologies/react-autoql/commit/f67bd3f160de76afc7ad5ab38ca83512299aa74e))
* **charts:** use correct range when negative values are present ([cac4981](https://github.com/chatatechnologies/react-autoql/commit/cac4981de7bff51726b647ae50ce81bdc21085a8))
* **dashboards:** add better messaging for empty tiles before and after running dashboard ([4e1475d](https://github.com/chatatechnologies/react-autoql/commit/4e1475d444ffa8df4e8981f2cc23faac533e9178))
* **dashboards:** fix drilldowns for list queries in bottom of split view dashboard tiles ([9c44c59](https://github.com/chatatechnologies/react-autoql/commit/9c44c598f0f11d2874f87f0a964d03740e16a6c7))
* **test page:** disable notifications by default on prod ([b57a514](https://github.com/chatatechnologies/react-autoql/commit/b57a5144578ecff1bac478581f457948bd9e09b7))

# [1.7.0](https://github.com/chatatechnologies/react-autoql/compare/v1.6.0...v1.7.0) (2020-06-29)


### Bug Fixes

* **charts:** fix bug where tooltip was displaying same category for all series ([4b88a4c](https://github.com/chatatechnologies/react-autoql/commit/4b88a4cdd2ed70789b8317a284a19e87ce166e6f))
* **dashboards:** a failing query in the second half of tile no longer blocks user ([9dda72c](https://github.com/chatatechnologies/react-autoql/commit/9dda72c4f607c2428adf7af40a7d114b5fee48d7)), closes [#49](https://github.com/chatatechnologies/react-autoql/issues/49)
* **dashboards:** fix bug where chart state in drilldown doesnt match the tile ([488dbdb](https://github.com/chatatechnologies/react-autoql/commit/488dbdbc0d5c8afdb2ea39dd2253ab689d142401))
* **dashboards:** update copy in empty state messages ([bb1ae57](https://github.com/chatatechnologies/react-autoql/commit/bb1ae579fdd9e8c1c9b08c14de9671a6fcf46a2c))
* **data messenger:** fix bug where data messenger doesnt scroll all the way to the bottom ([0a926b8](https://github.com/chatatechnologies/react-autoql/commit/0a926b89d32334f6a528832346de6e4b6bb6ce02))
* **data messenger:** fix bug where topics overflow message container ([cef9d4a](https://github.com/chatatechnologies/react-autoql/commit/cef9d4aa5ae256d473590734e8d9fbbaa5ba6f2a))
* **data messenger:** fix bug where you can see the hz scrollbar sometimes after clearing messages ([158e167](https://github.com/chatatechnologies/react-autoql/commit/158e167b4419816a703827567b6f7a4d2466526f))
* **security:** move semantic release to dev dependencies ([1146def](https://github.com/chatatechnologies/react-autoql/commit/1146def4599a094c6119fc18467911ca25471bfc))
* **tables:** fix bug where some string columns werent sorting ([5cbcb60](https://github.com/chatatechnologies/react-autoql/commit/5cbcb609df78fe3e5d13446de23e0b5cf0fa379b))


### Features

* **dashboards:** add isEditable prop ([28ad8de](https://github.com/chatatechnologies/react-autoql/commit/28ad8de7ed074bd557bdd30621059fdc1062f23f))
* **data messenger:** delete query message along with response message ([9f3d428](https://github.com/chatatechnologies/react-autoql/commit/9f3d42803d8df7a4a952b0b6ff2535cb0ed00e58)), closes [#44](https://github.com/chatatechnologies/react-autoql/issues/44)
* **notifications:** add notification option to dashboard tiles ([8959944](https://github.com/chatatechnologies/react-autoql/commit/8959944642ea6dba864a4543f30ba6ec51f66f1d))


### Reverts

* **npm packages:** revert rc-drawer update ([645b5bf](https://github.com/chatatechnologies/react-autoql/commit/645b5bf842537c18f19b8a7307118cc10b2514c5))

# [1.6.0](https://github.com/chatatechnologies/react-autoql/compare/v1.5.1...v1.6.0) (2020-06-09)


### Features

* **dashboard:** add options toolbar to dashboard tiles ([a86f07d](https://github.com/chatatechnologies/react-autoql/commit/a86f07d293cb0053214126d23c85bce3175edfa0)), closes [#32](https://github.com/chatatechnologies/react-autoql/issues/32)
* add changelog and git plugins or semantic release ([d01f2ea](https://github.com/chatatechnologies/react-autoql/commit/d01f2eae0fc1be8edc24a37187d7dcdbaebcddbb))
* add changelog file and release config file ([87d3b8c](https://github.com/chatatechnologies/react-autoql/commit/87d3b8c3fb317c8eec61737c8b502a159eed0f0e))
* add github plugin to semantic-release ([dbbebc9](https://github.com/chatatechnologies/react-autoql/commit/dbbebc92f17c964e6fd3121623eac5e859a24201))
* add github plugin to semantic-release ([6071564](https://github.com/chatatechnologies/react-autoql/commit/60715643445a8f9e7698f2578ac89a944f0b874e))
* update semantic release plugins ([87c1997](https://github.com/chatatechnologies/react-autoql/commit/87c1997e5386fb3baa810e5befa28b18eae81204))
* **demo:** add landing page prop selector to demo page ([8710899](https://github.com/chatatechnologies/react-autoql/commit/8710899d30225bdec63cdcb5781e5bb2c3d56356))
* **test release:** test ([8bed3f7](https://github.com/chatatechnologies/react-autoql/commit/8bed3f75b9da80f94ef8388eb517b693f6364082))

# [1.11.0](https://github.com/chatatechnologies/react-autoql/compare/v1.10.0...v1.11.0) (2020-06-03)


### Features

* add github plugin to semantic-release ([dbbebc9](https://github.com/chatatechnologies/react-autoql/commit/dbbebc92f17c964e6fd3121623eac5e859a24201))

# [1.10.0](https://github.com/chatatechnologies/react-autoql/compare/v1.9.0...v1.10.0) (2020-06-03)


### Features

* add github plugin to semantic-release ([6071564](https://github.com/chatatechnologies/react-autoql/commit/60715643445a8f9e7698f2578ac89a944f0b874e))

# [1.9.0](https://github.com/chatatechnologies/react-autoql/compare/v1.8.0...v1.9.0) (2020-06-03)


### Features

* update semantic release plugins ([87c1997](https://github.com/chatatechnologies/react-autoql/commit/87c1997e5386fb3baa810e5befa28b18eae81204))
