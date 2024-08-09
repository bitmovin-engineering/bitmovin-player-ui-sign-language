import { SettingsPanelPage } from '../settingspanelpage';
import { SettingsPanel } from '../settingspanel';
import { SettingsPanelItem } from '../settingspanelitem';
import { SettingsPanelPageBackButton } from '../settingspanelpagebackbutton';
import { SignLanguageSelectBox } from '../signlanguageselectbox'; // Assuming this is your avatar selection box
import { ContainerConfig } from '../container';
import { Component, ComponentConfig } from '../component';
import { i18n } from '../../localization/i18n';
import { UIInstanceManager } from '../../uimanager';
import { PlayerAPI } from 'bitmovin-player';
import { AvatarSelectBox } from './avatarselectbox' 
import { PositionSelectBox } from './positionselectbox'


export interface SignLanguageSettingsPanelPageConfig extends ContainerConfig {
  settingsPanel: SettingsPanel;
}

export class SignLanguageSettingsPanelPage extends SettingsPanelPage {
  private readonly settingsPanel: SettingsPanel;

  constructor(config: SignLanguageSettingsPanelPageConfig) {
    super(config);

    this.settingsPanel = config.settingsPanel;

    this.config = this.mergeConfig(config, {
      components: <Component<ComponentConfig>[]>[
        // Avatar Selection Menu Item
        new SettingsPanelItem(
          i18n.getLocalizer('Avatar Selection'), 
          new AvatarSelectBox()
        ),
        // Customize position
        new SettingsPanelItem(
            i18n.getLocalizer('Avatar Position'), 
            new PositionSelectBox()
        ),

        // Back Button
        new SettingsPanelItem(
          new SettingsPanelPageBackButton({
            container: this.settingsPanel,
            text: i18n.getLocalizer('back'),
          }),
          new Component<ComponentConfig>({}), 
          {
            role: 'menubar',
          }
        ),
      ],
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    // Add any additional configuration or event handling here if necessary
  }
}
