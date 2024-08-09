import { SelectBox } from '../selectbox'; // Adjust the path if needed
import { ListSelectorConfig } from '../listselector';
import { UIInstanceManager } from '../../uimanager';
import { PlayerAPI } from 'bitmovin-player';

export interface AvatarSelectBoxConfig extends ListSelectorConfig {
  // Additional configuration options for AvatarSelectBox can go here
}

export class AvatarSelectBox extends SelectBox {
  private avatars: string[] = [
    'monkey', 'anna', 'marc', 'francoise', 'luna', 'siggi',
    'robotboy', 'beatrice', 'genie', 'otis', 'darshan', 'candy',
    'max', 'carmen', 'dino', 'dinoex', 'dinototo'
  ];

  private currentCssClass: string | null;

  constructor(config: AvatarSelectBoxConfig = {}) {
    super(config);

    this.currentCssClass = null; // Initialize currentCssClass as null or use an empty string

    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-avatarselectbox'], // Update the CSS class as needed
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    // Add avatar options dynamically
    this.avatars.forEach(avatar => this.addItem(avatar, avatar.charAt(0).toUpperCase() + avatar.slice(1)));

    this.onItemSelected.subscribe((sender:AvatarSelectBox, value: string) => {
      this.handleAvatarSelection(value);
    });

    // Set default value to 'off'
    // this.selectItem('monkey');
  }

  protected handleAvatarSelection(value: string): void {
    const signLanguageContent = document.getElementById('sign-language-content');
    if (signLanguageContent) {
      if (value === 'off') {
        signLanguageContent.style.display = 'none';
      } else {
        this.switchAvatarDropdown(value);
        setTimeout(() => {
          signLanguageContent.style.display = 'block';
        }, 200); // Delay of 200 milliseconds
      }
    }
    this.selectItem(value);
  }

  protected switchAvatarDropdown(newAvatarName: string): void {
    const selectElement = document.querySelector('.menuAv.av0') as HTMLSelectElement;

    if (selectElement) {
      selectElement.value = newAvatarName;
      const event = new Event('change');
      selectElement.dispatchEvent(event);
      console.log(`Switched to avatar: ${newAvatarName}`);
    } else {
      console.error('Dropdown menu not found.');
    }
  }

  clearItems(): void {
    this.items = [];
    this.selectedItem = null;
  }

  protected toggleCssClass(cssClass: string | null): void {
    // Remove previous class if existing
    if (this.currentCssClass) {
      this.getDomElement().removeClass(this.currentCssClass);
      this.currentCssClass = null;
    }

    // Add new class if specified. If the new class is null, we don't add anything.
    if (cssClass) {
      this.currentCssClass = this.prefixCss(cssClass);
      this.getDomElement().addClass(this.currentCssClass);
    }
  }
}
