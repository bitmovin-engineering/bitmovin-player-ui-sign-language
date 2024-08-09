import { SelectBox } from './selectbox';
import { ListSelectorConfig } from './listselector';
import { UIInstanceManager } from '../uimanager';
import { PlayerAPI } from 'bitmovin-player';

export class SignLanguageSelectBox extends SelectBox {
  private avatars: string[] = [
    'off', 'anna', 'marc', 'francoise', 'luna', 'siggi',
    'robotboy', 'beatrice', 'genie', 'otis', 'darshan', 'candy',
    'max', 'carmen', 'monkey', 'dino', 'dinoex', 'dinototo', 'bahia'
  ];

  constructor(config: ListSelectorConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-signlanguageselectbox'],
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    // Add sign language avatar options dynamically
    this.avatars.forEach(avatar => this.addItem(avatar, avatar.charAt(0).toUpperCase() + avatar.slice(1)));

    this.onItemSelected.subscribe((sender: SignLanguageSelectBox, value: string) => {
      const signLanguageContent = document.getElementById('sign-language-content');
      if (signLanguageContent) {
        if (value === 'off') {
          signLanguageContent.style.display = 'none';
        } else {
          switchAvatarDropdown(value);
          setTimeout(() => {
            signLanguageContent.style.display = 'block';
          }, 100); // Delay of 200 milliseconds
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

// Function to switch avatar by selecting from the dropdown menu
function switchAvatarDropdown(newAvatarName: string): void {
  const selectElement = document.querySelector('.menuAv.av0') as HTMLSelectElement; // Cast to HTMLSelectElement

  if (selectElement) {
    selectElement.value = newAvatarName; // Set the dropdown to the new value
    const event = new Event('change'); // Create a change event
    selectElement.dispatchEvent(event); // Dispatch the event to trigger any attached event handlers
    console.log(`Switched to avatar: ${newAvatarName}`);
  } else {
    console.error('Dropdown menu not found.');
  }
}
