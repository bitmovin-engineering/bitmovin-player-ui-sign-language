import { SelectBox } from './selectbox';
import { ListSelectorConfig } from './listselector';
import { UIInstanceManager } from '../uimanager';
import { PlayerAPI } from 'bitmovin-player';

export class SignLanguageSelectBox extends SelectBox {
  private avatars: string[] = [
    'off', 'on'
  ];

  constructor(config: ListSelectorConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-signlanguageselectbox'],
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    // Add "on" and "off" options dynamically
    this.avatars.forEach(avatar => this.addItem(avatar, avatar.charAt(0) + avatar.slice(1)));

    this.onItemSelected.subscribe((sender: SignLanguageSelectBox, value: string) => {
      const signLanguageContent = document.getElementById('sign-language-content');
      if (signLanguageContent) {
        if (value === 'off') {
          signLanguageContent.style.display = 'none';
        } else if (value === 'on') {
          setTimeout(() => {
            signLanguageContent.style.display = 'block';
          }, 200); // Delay of 200 milliseconds
        }
      }

      this.selectItem(value);
    });

    // Set default value to 'off'
    this.selectItem('off');
  }

  clearItems(): void {
    this.items = [];
    this.selectedItem = null;
  }
}
