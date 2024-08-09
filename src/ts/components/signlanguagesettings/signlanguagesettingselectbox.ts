import { AvatarSelectBox, AvatarSelectBoxConfig } from './avatarselectbox'; // Ensure the path is correct
import { UIInstanceManager } from '../../uimanager';
import { PlayerAPI } from 'bitmovin-player';

export interface SignLanguageSettingSelectBoxConfig extends AvatarSelectBoxConfig {
  // Additional configuration options for SignLanguageSettingSelectBox can go here
}

export class SignLanguageSettingSelectBox extends AvatarSelectBox {

  constructor(config: SignLanguageSettingSelectBoxConfig) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-signlanguagesettingselectbox'], // Update the CSS class
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    // Additional configuration or logic specific to Sign Language settings if needed
  }

  // Optionally, override or extend methods from AvatarSelectBox if needed
  // For example, you might want to handle the selection differently or add additional behavior
}
